import { Grid, Typography } from "@mui/material";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { ProjectsApi, Configuration } from "../../client";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:4000";
const projectsApi = new ProjectsApi(new Configuration());
const queryClient = new QueryClient();

interface HomeProps {
   server?: string;
   navigate?: (to: string, event?: React.MouseEvent) => void;
}

export default function Home({ server, navigate }: HomeProps) {
   const { data, isSuccess } = useQuery(
      {
         queryKey: ["projects", server],
         queryFn: () =>
            projectsApi.listProjects({
               baseURL: server,
            }),
      },
      queryClient,
   );

   console.log(JSON.stringify(data?.data, null, 2));

   if (isSuccess) {
      if (data.data.length === 0) {
         return <Typography variant="h4">No projects found</Typography>;
      } else if (data.data.length === 1) {
         navigate(`/${data.data[0].name}/`);
         return <></>;
      } else {
         return (
            <Grid
               container
               spacing={2}
               columns={12}
               sx={{ mb: (theme) => theme.spacing(2) }}
            >
               {data.data.map((project) => (
                  <Grid key={project.name}>
                     <Typography
                        variant="h1"
                        onClick={(event) =>
                           navigate(`/${project.name}/`, event)
                        }
                     >
                        {project.name}
                     </Typography>
                  </Grid>
               ))}
            </Grid>
         );
      }
   } else {
      return <Typography variant="h6">Loading projects...</Typography>;
   }
}
