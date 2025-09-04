import { Box, Typography } from "@mui/material";
import { Configuration, ModelsApi } from "../../client";
import { useQueryWithApiError } from "../../hooks/useQueryWithApiError";
import { ApiErrorDisplay } from "../ApiErrorDisplay";
import { Loading } from "../Loading";
import {
   PackageCard,
   PackageCardContent,
   PackageSectionTitle,
} from "../styles";
import { FileTreeView } from "./FileTreeView";
import { PublisherResourceProvider } from "./PublisherResourceProvider";
import { encodeResourceUri } from "../../utils/formatting";

const modelsApi = new ModelsApi(new Configuration());

const DEFAULT_EXPANDED_FOLDERS = ["notebooks/", "models/"];

interface ModelsProps {
   navigate: (to: string, event?: React.MouseEvent) => void;
   projectName: string;
   packageName: string;
   versionId?: string;
}

export default function Models({
   navigate,
   projectName,
   packageName,
   versionId,
}: ModelsProps) {
   const { data, isError, error, isSuccess } = useQueryWithApiError({
      queryKey: ["models", projectName, packageName, versionId],
      queryFn: (config) =>
         modelsApi.listModels(projectName, packageName, versionId, config),
   });

   const resourceUri = encodeResourceUri({
      project: projectName,
      package: packageName,
      version: versionId,
   });
   return (
      <PublisherResourceProvider resourceUri={resourceUri}>
         <PackageCard>
            <PackageCardContent>
               <PackageSectionTitle>Semantic Models</PackageSectionTitle>
               <Box
                  sx={{
                     maxHeight: "200px",
                     overflowY: "auto",
                  }}
               >
                  {!isSuccess && !isError && (
                     <Loading text="Fetching Models..." />
                  )}
                  {isError && (
                     <ApiErrorDisplay
                        error={error}
                        context={`${projectName} > ${packageName} > Models`}
                     />
                  )}
                  {isSuccess && data.data.length > 0 && (
                     <FileTreeView
                        items={data.data.sort((a, b) => {
                           return a.path.localeCompare(b.path);
                        })}
                        navigate={navigate}
                        defaultExpandedItems={DEFAULT_EXPANDED_FOLDERS}
                     />
                  )}
                  {isSuccess && data.data.length === 0 && (
                     <Typography variant="body2">No models found</Typography>
                  )}
               </Box>
            </PackageCardContent>
         </PackageCard>
      </PublisherResourceProvider>
   );
}
