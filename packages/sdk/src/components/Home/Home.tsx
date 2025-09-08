import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import {
   Box,
   Button,
   Card,
   CardContent,
   Chip,
   Container,
   Divider,
   Grid,
   Stack,
   Typography,
} from "@mui/material";
import { useQueryWithApiError } from "../../hooks/useQueryWithApiError";
import { ApiErrorDisplay } from "../ApiErrorDisplay";
import { Loading } from "../Loading";
import { useApiClients } from "../ServerProvider";

interface HomeProps {
   navigate?: (to: string, event?: React.MouseEvent) => void;
}

// Helper function to extract a brief description from README content
const getProjectDescription = (readme: string | undefined): string => {
   if (!readme) {
      return "Explore semantic models, run queries, and build dashboards";
   }

   // Remove markdown formatting and get first paragraph
   const cleanText = readme
      .replace(/^#+\s+/gm, "") // Remove headers
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
      .replace(/\*(.*?)\*/g, "$1") // Remove italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links
      .replace(/`([^`]+)`/g, "$1") // Remove code
      .trim();

   // Get first paragraph (split by double newlines)
   const paragraphs = cleanText.split(/\n\s*\n/);
   const firstParagraph = paragraphs[0] || cleanText;

   // Limit to ~120 characters
   if (firstParagraph.length <= 120) {
      return firstParagraph;
   }

   // Truncate at word boundary
   const truncated = firstParagraph.substring(0, 120).split(" ");
   truncated.pop(); // Remove last partial word
   return truncated.join(" ") + "...";
};

export default function Home({ navigate }: HomeProps) {
   const { projects } = useApiClients();

   const { data, isSuccess, isError, error } = useQueryWithApiError({
      queryKey: ["projects"],
      queryFn: () => projects.listProjects(),
   });

   if (isError) {
      return <ApiErrorDisplay error={error} context="Projects List" />;
   }

   if (isSuccess) {
      return (
         <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Hero Section */}
            <Box sx={{ textAlign: "center", mb: 6 }}>
               <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  spacing={1}
                  sx={{ mb: 2 }}
               >
                  <AutoAwesomeRoundedIcon
                     sx={{ fontSize: 32, color: "primary.main" }}
                  />
                  <Typography variant="h3" component="h1" fontWeight={700}>
                     Publisher
                  </Typography>
               </Stack>
               <Typography
                  variant="h5"
                  color="text.secondary"
                  sx={{ mb: 3, maxWidth: 600, mx: "auto" }}
               >
                  The open-source semantic model server for the Malloy data
                  language
               </Typography>
               <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ maxWidth: 800, mx: "auto" }}
               >
                  Define semantic models once — and use them everywhere.
                  Publisher serves Malloy models through clean APIs, enabling
                  consistent, interpretable, and AI-ready data access for tools,
                  applications, and agents.
               </Typography>
            </Box>

            {/* Feature Cards */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
               <Grid size={{ xs: 12, md: 4 }}>
                  <Card
                     variant="outlined"
                     onClick={() => {
                        window.open(
                           "https://github.com/malloydata/publisher/blob/main/README.md#ad-hoc-data-analysis",
                           "_blank",
                        );
                     }}
                     sx={{
                        height: "100%",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": {
                           transform: "translateY(-2px)",
                           boxShadow: 2,
                        },
                     }}
                  >
                     <CardContent sx={{ p: 3 }}>
                        <Stack
                           direction="row"
                           alignItems="center"
                           spacing={1}
                           sx={{ mb: 2 }}
                        >
                           <AnalyticsRoundedIcon
                              sx={{ color: "info.main", fontSize: 28 }}
                           />
                           <Typography variant="h6" fontWeight={600}>
                              Ad Hoc Analysis
                           </Typography>
                        </Stack>
                        <Typography
                           variant="body2"
                           color="text.secondary"
                           sx={{ mb: 2 }}
                        >
                           Use Explorer, a visual query builder that allows
                           analysts to browse semantic sources, build queries,
                           and run nested logic — all without writing code.
                        </Typography>
                        <Chip
                           label="No-code"
                           size="small"
                           color="primary"
                           variant="outlined"
                        />
                     </CardContent>
                  </Card>
               </Grid>

               <Grid size={{ xs: 12, md: 4 }}>
                  <Card
                     variant="outlined"
                     onClick={() => {
                        window.open(
                           "https://github.com/malloydata/publisher/blob/main/README.md#notebook-based-dashboards",
                           "_blank",
                        );
                     }}
                     sx={{
                        height: "100%",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": {
                           transform: "translateY(-2px)",
                           boxShadow: 2,
                        },
                     }}
                  >
                     <CardContent sx={{ p: 3 }}>
                        <Stack
                           direction="row"
                           alignItems="center"
                           spacing={1}
                           sx={{ mb: 2 }}
                        >
                           <CodeRoundedIcon
                              sx={{ color: "warning.main", fontSize: 28 }}
                           />
                           <Typography variant="h6" fontWeight={600}>
                              Notebook Dashboards
                           </Typography>
                        </Stack>
                        <Typography
                           variant="body2"
                           color="text.secondary"
                           sx={{ mb: 2 }}
                        >
                           Create shareable, code-first dashboards using Malloy
                           notebooks. Include text, charts, and reusable views —
                           all versioned alongside your models.
                        </Typography>
                        <Chip
                           label="Versioned"
                           size="small"
                           color="warning"
                           variant="outlined"
                        />
                     </CardContent>
                  </Card>
               </Grid>

               <Grid size={{ xs: 12, md: 4 }}>
                  <Card
                     variant="outlined"
                     onClick={() => {
                        window.open(
                           "https://github.com/malloydata/publisher/blob/main/README.md#mcp-based-ai-data-agents",
                           "_blank",
                        );
                     }}
                     sx={{
                        height: "100%",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": {
                           transform: "translateY(-2px)",
                           boxShadow: 2,
                        },
                     }}
                  >
                     <CardContent sx={{ p: 3 }}>
                        <Stack
                           direction="row"
                           alignItems="center"
                           spacing={1}
                           sx={{ mb: 2 }}
                        >
                           <PsychologyRoundedIcon
                              sx={{ color: "success.main", fontSize: 28 }}
                           />
                           <Typography variant="h6" fontWeight={600}>
                              AI Data Agents
                           </Typography>
                        </Stack>
                        <Typography
                           variant="body2"
                           color="text.secondary"
                           sx={{ mb: 2 }}
                        >
                           Expose your semantic models via the Model Context
                           Protocol (MCP), enabling AI agents to discover
                           sources and ask well-formed questions.
                        </Typography>
                        <Chip
                           label="AI-Ready"
                           size="small"
                           color="success"
                           variant="outlined"
                        />
                     </CardContent>
                  </Card>
               </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Project Selection Section */}
            {data.data.length > 0 ? (
               <>
                  <Box sx={{ textAlign: "center", mb: 4 }}>
                     <Stack
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={1}
                        sx={{ mb: 2 }}
                     >
                        <StorageRoundedIcon
                           sx={{ color: "primary.main", fontSize: 24 }}
                        />
                        <Typography variant="h4" fontWeight={600}>
                           Select a Project
                        </Typography>
                     </Stack>
                     <Typography variant="body1" color="text.secondary">
                        Choose a project to explore its semantic models and
                        start analyzing your data
                     </Typography>
                  </Box>
                  <Grid container spacing={3} justifyContent="center">
                     {data.data.map((project) => (
                        <Grid
                           size={{ xs: 12, sm: 6, md: 4 }}
                           key={project.name}
                        >
                           <Card
                              variant="outlined"
                              sx={{
                                 height: "100%",
                                 cursor: "pointer",
                                 transition: "all 0.2s ease",
                                 "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: 2,
                                    borderColor: "primary.main",
                                 },
                              }}
                              onClick={(event) =>
                                 navigate(`/${project.name}/`, event)
                              }
                           >
                              <CardContent sx={{ p: 3, textAlign: "center" }}>
                                 <ExploreRoundedIcon
                                    sx={{
                                       fontSize: 48,
                                       color: "primary.main",
                                       mb: 2,
                                    }}
                                 />
                                 <Typography
                                    variant="h6"
                                    fontWeight={600}
                                    gutterBottom
                                 >
                                    {project.name}
                                 </Typography>
                                 <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 2 }}
                                 >
                                    {getProjectDescription(project.readme)}
                                 </Typography>
                                 <Button
                                    variant="contained"
                                    color="secondary"
                                    endIcon={<ArrowForwardRoundedIcon />}
                                    fullWidth
                                 >
                                    Open Project
                                 </Button>
                              </CardContent>
                           </Card>
                        </Grid>
                     ))}
                  </Grid>
               </>
            ) : (
               <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Stack
                     direction="row"
                     justifyContent="center"
                     alignItems="center"
                     spacing={1}
                     sx={{ mb: 2 }}
                  >
                     <StorageRoundedIcon
                        sx={{ color: "primary.main", fontSize: 24 }}
                     />
                     <Typography variant="h4" fontWeight={600}>
                        Get Started
                     </Typography>
                  </Stack>
                  <Typography
                     variant="body1"
                     color="text.secondary"
                     sx={{ mb: 3 }}
                  >
                     No projects found. Create your first Malloy project to
                     start exploring semantic models and building data
                     experiences.
                  </Typography>
                  <Button
                     variant="contained"
                     size="large"
                     color="primary"
                     startIcon={<AutoAwesomeRoundedIcon />}
                     href="https://github.com/malloydata/publisher/blob/main/README.md#server-configuration"
                     target="_blank"
                     rel="noopener noreferrer"
                  >
                     Learn How to Create Models
                  </Button>
               </Box>
            )}

            {/* Footer Section */}
            <Box
               sx={{
                  textAlign: "center",
                  mt: 6,
                  pt: 4,
                  borderTop: 1,
                  borderColor: "divider",
               }}
            >
               <Typography variant="body2" color="text.secondary">
                  Publisher is built on fully open infrastructure and designed
                  for the AI era. Join the{" "}
                  <a
                     href="https://join.slack.com/t/malloy-community/shared_invite/zt-1kgfwgi5g-CrsdaRqs81QY67QW0~t_uw"
                     target="_blank"
                     rel="noopener noreferrer"
                     style={{
                        color: "primary.main",
                        textDecoration: "underline",
                     }}
                  >
                     Malloy Slack community
                  </a>{" "}
                  to ask questions, share ideas, and contribute to the future of
                  data modeling.
               </Typography>
            </Box>
         </Container>
      );
   } else {
      return <Loading text="Loading projects..." />;
   }
}
