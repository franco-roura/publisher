import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import {
   Box,
   CardActions,
   Collapse,
   Divider,
   IconButton,
   Stack,
   Tab,
   Tabs,
   Tooltip,
   Typography,
} from "@mui/material";
import { QueryClient, useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { Configuration, ModelsApi, CompiledModel } from "../../client";
import { highlight } from "../highlighter";
import { StyledCard, StyledCardContent, StyledCardMedia } from "../styles";
import { ModelCell } from "./ModelCell";
import { ApiErrorDisplay, ApiError } from "../ApiErrorDisplay";

import "@malloydata/malloy-explorer/styles.css";
import { usePublisherPackage } from "../Package/PublisherPackageProvider";
import { SourceExplorerComponent } from "./SourcesExplorer";
import NamedQueries from "./NamedQueries";

const modelsApi = new ModelsApi(new Configuration());

const queryClient = new QueryClient();

interface ModelProps {
   modelPath: string;
   versionId?: string;
   expandResults?: boolean;
   hideResultIcons?: boolean;
   expandEmbeddings?: boolean;
   hideEmbeddingIcons?: boolean;
}

// Note: For this to properly render outside of publisher,
// you must explicitly import the styles from the package:
// import "@malloy-publisher/sdk/malloy-explorer.css";

export default function Model({
   modelPath,
   expandResults,
   hideResultIcons,
   expandEmbeddings,
   hideEmbeddingIcons,
}: ModelProps) {
   const [embeddingExpanded, setEmbeddingExpanded] =
      React.useState<boolean>(false);
   const [highlightedEmbedCode, setHighlightedEmbedCode] =
      React.useState<string>();
   const [selectedTab, setSelectedTab] = React.useState(0);

   const { server, projectName, packageName, versionId, accessToken } =
      usePublisherPackage();
   const modelCodeSnippet = getModelCodeSnippet(server, packageName, modelPath);
   useEffect(() => {
      highlight(modelCodeSnippet, "typescript").then((code) => {
         setHighlightedEmbedCode(code);
      });
   }, [embeddingExpanded, modelCodeSnippet]);

   const { data, isError, isLoading, error } = useQuery<
      CompiledModel,
      ApiError
   >(
      {
         queryKey: [
            "package",
            server,
            projectName,
            packageName,
            modelPath,
            versionId,
         ],
         queryFn: async () => {
            try {
               const response = await modelsApi.getModel(
                  projectName,
                  packageName,
                  modelPath,
                  versionId,
                  {
                     baseURL: server,
                     withCredentials: !accessToken,
                     headers: {
                        Authorization: accessToken && `Bearer ${accessToken}`,
                     },
                  },
               );
               return response.data;
            } catch (err) {
               // If it's an Axios error, it will have response data
               if (err && typeof err === "object" && "response" in err) {
                  console.log("axios err", err);
                  const axiosError = err as any;
                  if (axiosError.response?.data) {
                     const apiError: ApiError = new Error(
                        axiosError.response.data.message || axiosError.message,
                     );
                     apiError.status = axiosError.response.status;
                     apiError.data = axiosError.response.data;
                     throw apiError;
                  }
               }
               // For other errors, throw as is
               throw err;
            }
         },
         retry: false,
         throwOnError: false,
      },
      queryClient,
   );

   if (isLoading) {
      return (
         <Typography sx={{ p: "20px", m: "auto" }}>
            Fetching Model...
         </Typography>
      );
   }

   if (isError) {
      console.log("error", error);
      return (
         <ApiErrorDisplay
            error={error}
            context={`${packageName} > ${modelPath}`}
         />
      );
   }
   return (
      <StyledCard variant="outlined">
         <StyledCardContent>
            <Stack
               sx={{
                  flexDirection: "row",
                  justifyContent: "space-between",
               }}
            >
               {Array.isArray(data.sourceInfos) &&
                  data.sourceInfos.length > 0 && (
                     <Tabs
                        value={selectedTab}
                        onChange={(_, newValue) => setSelectedTab(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                           borderBottom: 1,
                           borderColor: "divider",
                           minHeight: 36,
                        }}
                     >
                        {data.sourceInfos.map((source, idx) => {
                           let sourceInfo;
                           try {
                              sourceInfo = JSON.parse(source);
                           } catch {
                              sourceInfo = { name: String(idx) };
                           }
                           return (
                              <Tab
                                 key={sourceInfo.name || idx}
                                 label={sourceInfo.name || `Source ${idx + 1}`}
                                 sx={{ minHeight: 36 }}
                              />
                           );
                        })}
                     </Tabs>
                  )}
               {!hideEmbeddingIcons && (
                  <CardActions
                     sx={{
                        padding: "0px 10px 0px 10px",
                        mb: "auto",
                        mt: "auto",
                     }}
                  >
                     <Tooltip
                        title={
                           embeddingExpanded
                              ? "Hide Embedding"
                              : "View Embedding"
                        }
                     >
                        <IconButton
                           size="small"
                           onClick={() => {
                              setEmbeddingExpanded(!embeddingExpanded);
                           }}
                        >
                           <LinkOutlinedIcon />
                        </IconButton>
                     </Tooltip>
                  </CardActions>
               )}
            </Stack>
            <Collapse in={embeddingExpanded} timeout="auto" unmountOnExit>
               <Divider />
               <Stack
                  sx={{
                     p: "10px",
                     borderRadius: 0,
                     flexDirection: "row",
                     justifyContent: "space-between",
                  }}
               >
                  <Typography
                     sx={{
                        fontSize: "12px",
                        "& .line": { textWrap: "wrap" },
                     }}
                  >
                     <div
                        dangerouslySetInnerHTML={{
                           __html: highlightedEmbedCode,
                        }}
                     />
                  </Typography>
                  <Tooltip title="Copy Embeddable Code">
                     <IconButton
                        sx={{ width: "24px", height: "24px" }}
                        onClick={() => {
                           navigator.clipboard.writeText(modelCodeSnippet);
                        }}
                     >
                        <ContentCopyIcon />
                     </IconButton>
                  </Tooltip>
               </Stack>
            </Collapse>
            <Divider />
         </StyledCardContent>
         <StyledCardMedia>
            <Stack spacing={2} component="section">
               {/* Only render the selected sourceInfo */}
               {Array.isArray(data.sourceInfos) &&
                  data.sourceInfos.length > 0 && (
                     <SourceExplorerComponent
                        sourceAndPath={{
                           modelPath,
                           sourceInfo: JSON.parse(
                              data.sourceInfos[selectedTab],
                           ),
                        }}
                     />
                  )}
               {data.queries?.length > 0 && (
                  <StyledCard
                     variant="outlined"
                     sx={{ padding: "0px 10px 0px 10px" }}
                  >
                     <StyledCardContent sx={{ p: "10px" }}>
                        <Typography variant="subtitle1">
                           Named Queries
                        </Typography>
                     </StyledCardContent>
                     <Stack spacing={1} component="section">
                        {data.queries.map((query) => (
                           <ModelCell
                              key={query.name}
                              server={server}
                              projectName={projectName}
                              packageName={packageName}
                              modelPath={modelPath}
                              versionId={versionId}
                              queryName={query.name}
                              expandResult={expandResults}
                              hideResultIcon={hideResultIcons}
                              expandEmbedding={expandEmbeddings}
                              hideEmbeddingIcon={hideEmbeddingIcons}
                              accessToken={accessToken}
                              noView={true}
                              annotations={query.annotations}
                           />
                        ))}
                     </Stack>
                     <Box height="10px" />
                  </StyledCard>
               )}
               <Box height="5px" />
            </Stack>
         </StyledCardMedia>
      </StyledCard>
   );
}

function getModelCodeSnippet(
   server: string,
   packageName: string,
   modelPath: string,
): string {
   return `<Model
   server="${server}"
   packageName="${packageName}"
   modelPath="${modelPath}"
   accessToken={accessToken}
/>`;
}
