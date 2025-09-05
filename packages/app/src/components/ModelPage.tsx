import { encodeResourceUri, Model, Notebook } from "@malloy-publisher/sdk";
import { useParams } from "react-router-dom";

export function ModelPage() {
   const params = useParams();
   const modelPath = params["*"];
   if (!params.projectName) {
      return (
         <div>
            <h2>Missing project name</h2>
         </div>
      );
   }
   if (!params.packageName) {
      return (
         <div>
            <h2>Missing package name</h2>
         </div>
      );
   }
   const resourceUri = encodeResourceUri({
      projectName: params.projectName,
      packageName: params.packageName,
      modelPath,
   });

   if (modelPath?.endsWith(".malloy")) {
      return <Model resourceUri={resourceUri} />;
   }
   if (modelPath?.endsWith(".malloynb")) {
      return <Notebook resourceUri={resourceUri} />;
   }
   return (
      <div>
         <h2>Unrecognized file type: {modelPath}</h2>
      </div>
   );
}
