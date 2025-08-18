import { components } from "../api";
import { publisherPath } from "../constants";
import { BadRequestError, FrozenConfigError } from "../errors";
import { ProjectStore } from "../service/project_store";

type ApiPackage = components["schemas"]["Package"];

export class PackageController {
   private projectStore: ProjectStore;

   constructor(projectStore: ProjectStore) {
      this.projectStore = projectStore;
   }

   public async listPackages(projectName: string): Promise<ApiPackage[]> {
      const project = await this.projectStore.getProject(projectName, false);
      return project.listPackages();
   }

   public async getPackage(
      projectName: string,
      packageName: string,
      reload: boolean,
   ): Promise<ApiPackage> {
      const project = await this.projectStore.getProject(projectName, false);
      const _package = await project.getPackage(packageName, reload);
      const packageLocation = _package.getPackageMetadata().location;
      if (reload && packageLocation) {
         await this.downloadPackage(projectName, packageName, packageLocation);
      }
      return _package.getPackageMetadata();
   }

   async addPackage(projectName: string, body: ApiPackage) {
      if (this.projectStore.publisherConfigIsFrozen) {
         throw new FrozenConfigError();
      }
      if (!body.name) {
         throw new BadRequestError("Package name is required");
      }
      const project = await this.projectStore.getProject(projectName, false);
      if (body.location) {
         await this.downloadPackage(projectName, body.name, body.location);
      }
      return project.addPackage(body.name);
   }

   public async deletePackage(projectName: string, packageName: string) {
      if (this.projectStore.publisherConfigIsFrozen) {
         throw new FrozenConfigError();
      }
      const project = await this.projectStore.getProject(projectName, false);
      return project.deletePackage(packageName);
   }

   public async updatePackage(
      projectName: string,
      packageName: string,
      body: ApiPackage,
   ) {
      if (this.projectStore.publisherConfigIsFrozen) {
         throw new FrozenConfigError();
      }
      const project = await this.projectStore.getProject(projectName, false);
      if (body.location) {
         await this.downloadPackage(projectName, packageName, body.location);
      }
      return project.updatePackage(packageName, body);
   }

   private async downloadPackage(
      projectName: string,
      packageName: string,
      packageLocation: string,
   ) {
      const absoluteTargetPath = `${publisherPath}/${projectName}/${packageName}`;
      if (
         packageLocation.startsWith("https://") ||
         packageLocation.startsWith("git@")
      ) {
         await this.projectStore.downloadGitHubDirectory(
            packageLocation,
            absoluteTargetPath,
         );
      } else if (packageLocation.startsWith("gs://")) {
         await this.projectStore.downloadGcsDirectory(
            packageLocation,
            projectName,
            absoluteTargetPath,
         );
      } else if (packageLocation.startsWith("s3://")) {
         await this.projectStore.downloadS3Directory(
            packageLocation,
            projectName,
            absoluteTargetPath,
         );
      } else if (packageLocation.startsWith("/")) {
         if (packageLocation.endsWith(".zip")) {
            packageLocation =
               await this.projectStore.unzipProject(packageLocation);
         }
         await this.projectStore.mountLocalDirectory(
            packageLocation,
            absoluteTargetPath,
            projectName,
            packageName,
         );
      }
   }
}
