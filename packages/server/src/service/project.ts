import { BaseConnection } from "@malloydata/malloy/connection";
import * as fs from "fs/promises";
import * as path from "path";
import { components } from "../api";
import { API_PREFIX, README_NAME } from "../constants";
import { ConnectionNotFoundError, ProjectNotFoundError } from "../errors";
import { createConnections, InternalConnection } from "./connection";
import { ApiConnection } from "./model";
import { Package } from "./package";
type ApiPackage = components["schemas"]["Package"];
type ApiProject = components["schemas"]["Project"];

const MAX_PACKAGE_INIT_TIMEOUT = 20000;

export class Project {
   private packages: Map<string, Package> = new Map();
   private malloyConnections: Map<string, BaseConnection>;
   private apiConnections: ApiConnection[];
   private internalConnections: InternalConnection[];
   private projectPath: string;
   private projectName: string;

   constructor(
      projectName: string,
      projectPath: string,
      malloyConnections: Map<string, BaseConnection>,
      internalConnections: InternalConnection[],
      apiConnections: InternalConnection[],
   ) {
      this.projectName = projectName;
      this.projectPath = projectPath;
      this.malloyConnections = malloyConnections;
      // InternalConnections have full connection details for doing schema inspection
      this.internalConnections = internalConnections;
      this.apiConnections = apiConnections;
   }

   static async create(
      projectName: string,
      projectPath: string,
   ): Promise<Project> {
      if (!(await fs.stat(projectPath)).isDirectory()) {
         throw new ProjectNotFoundError(
            `Project path ${projectPath} not found`,
         );
      }
      const { malloyConnections, apiConnections } =
         await createConnections(projectPath);
      return new Project(
         projectName,
         projectPath,
         malloyConnections,
         apiConnections,
         apiConnections.map((internalConnection) => {
            // Create a new ApiConnection object from each InternalConnection
            // by excluding the internal connection details
            // We don't want to send passwords and connection strings to the client
            return {
               name: internalConnection.name,
               type: internalConnection.type,
               attributes: internalConnection.attributes,
               resource: internalConnection.resource,
            };
         }),
      );
   }

   public async getProjectMetadata(): Promise<ApiProject> {
      let readme = "";
      try {
         readme = (
            await fs.readFile(path.join(this.projectPath, README_NAME))
         ).toString();
      } catch {
         // Readme not found, so we'll just return an empty string
      }
      return {
         resource: `${API_PREFIX}/projects/${this.projectName}`,
         name: this.projectName,
         readme: readme,
      };
   }

   public listApiConnections(): ApiConnection[] {
      return this.apiConnections;
   }

   public getApiConnection(connectionName: string): ApiConnection {
      const connection = this.apiConnections.find(
         (connection) => connection.name === connectionName,
      );
      if (!connection) {
         throw new ConnectionNotFoundError(
            `Connection ${connectionName} not found`,
         );
      }
      return connection;
   }

   // Returns a connection with full connection details for doing schema inspection
   // Don't send this to the client as it contains sensitive information
   public getInternalConnection(connectionName: string): InternalConnection {
      const connection = this.internalConnections.find(
         (connection) => connection.name === connectionName,
      );
      if (!connection) {
         throw new ConnectionNotFoundError(
            `Connection ${connectionName} not found`,
         );
      }
      return connection;
   }

   public getMalloyConnection(connectionName: string): BaseConnection {
      const connection = this.malloyConnections.get(connectionName);
      if (!connection) {
         throw new ConnectionNotFoundError(
            `Connection ${connectionName} not found`,
         );
      }
      return connection;
   }

   public async listPackages(): Promise<ApiPackage[]> {
      try {
         const files = await fs.readdir(this.projectPath, {
            withFileTypes: true,
         });
         const packageMetadata = await Promise.all(
            files
               .filter((file) => file.isDirectory())
               .map(async (directory) => {
                  try {
                     // Create a timeout promise that rejects after 6 seconds
                     const timeoutPromise = new Promise<never>((_, reject) => {
                        setTimeout(() => {
                           reject(new Error(`Package loading timeout`));
                        }, MAX_PACKAGE_INIT_TIMEOUT);
                     });

                     // Race between the actual package loading and the timeout
                     const _package = await Promise.race([
                        this.getPackage(directory.name, false),
                        timeoutPromise,
                     ]);

                     return _package.getPackageMetadata();
                  } catch (error) {
                     console.log(
                        `Failed to load package: ${directory.name} due to : ${error}`,
                     );
                     // Directory did not contain a valid package.json file -- therefore, it's not a package.
                     // Or it timed out
                     return undefined;
                  }
               }),
         );
         // Get rid of undefined entries (i.e, directories without publisher.json files).
         const filteredMetadata = packageMetadata.filter(
            (metadata) => metadata,
         ) as ApiPackage[];
         return filteredMetadata;
      } catch (error) {
         throw new Error("Error listing packages: " + error);
      }
   }

   public async getPackage(
      packageName: string,
      reload: boolean,
   ): Promise<Package> {
      let _package = this.packages.get(packageName);
      if (_package === undefined || reload) {
         try {
            _package = await Package.create(
               this.projectName,
               packageName,
               path.join(this.projectPath, packageName),
               this.malloyConnections,
            );
            this.packages.set(packageName, _package);
         } catch (error) {
            this.packages.delete(packageName);
            throw error;
         }
      }
      return _package;
   }
}
