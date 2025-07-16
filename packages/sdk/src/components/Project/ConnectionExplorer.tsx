import React from "react";
import {
   Box,
   List,
   ListItemButton,
   ListItemText,
   Typography,
   Divider,
   Paper,
   Grid,
   Dialog,
   DialogContent,
   DialogTitle,
   IconButton,
   Switch,
   FormControlLabel,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
} from "@mui/material";
import { ConnectionsApi } from "../../client/api";
import { Configuration } from "../../client/configuration";
import { useProject } from "./Project";
import { ApiErrorDisplay } from "../ApiErrorDisplay";
import { Loading } from "../Loading";
import { useQueryWithApiError } from "../../hooks/useQueryWithApiError";

const connectionsApi = new ConnectionsApi(new Configuration());

interface ConnectionExplorerProps {
   connectionName: string;
}

export default function ConnectionExplorer({
   connectionName,
}: ConnectionExplorerProps) {
   const { projectName } = useProject();

   const [selectedTable, setSelectedTable] = React.useState<string | undefined>(
      undefined,
   );
   const [selectedSchema, setSelectedSchema] = React.useState<string | null>(
      null,
   );
   const [showHiddenSchemas, setShowHiddenSchemas] = React.useState(false);
   const { data, isSuccess, isError, error, isLoading } = useQueryWithApiError({
      queryKey: ["tablePath", projectName, connectionName],
      queryFn: (config) =>
         connectionsApi.listSchemas(projectName, connectionName, config),
   });

   return (
      <Grid container spacing={2}>
         <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
               <Box
                  sx={{
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "space-between",
                     mb: 1,
                  }}
               >
                  <Typography variant="overline" fontWeight="bold">
                     Table Paths
                  </Typography>
                  <FormControlLabel
                     control={
                        <Switch
                           checked={showHiddenSchemas}
                           onChange={(e) =>
                              setShowHiddenSchemas(e.target.checked)
                           }
                        />
                     }
                     label="Hidden Schemas"
                  />
               </Box>
               <Divider />
               <Box sx={{ mt: "10px", maxHeight: "600px", overflowY: "auto" }}>
                  {isLoading && <Loading text="Fetching Table Paths..." />}
                  {isError && (
                     <ApiErrorDisplay
                        error={error}
                        context={`${projectName} > ${connectionName}`}
                     />
                  )}
                  {isSuccess && data.data.length === 0 && (
                     <Typography variant="body2">No Schemas</Typography>
                  )}
                  {isSuccess && data.data.length > 0 && (
                     <List dense disablePadding>
                        {data.data
                           .filter(
                              ({ isHidden }) => showHiddenSchemas || !isHidden,
                           )
                           .sort((a, b) => {
                              if (a.isDefault === b.isDefault) return 0;
                              return a.isDefault ? -1 : 1;
                           })
                           .map(
                              (schema: {
                                 name: string;
                                 isDefault: boolean;
                              }) => (
                                 <ListItemButton
                                    key={schema.name}
                                    selected={selectedSchema === schema.name}
                                    onClick={() =>
                                       setSelectedSchema(schema.name)
                                    }
                                 >
                                    <ListItemText primary={schema.name} />
                                 </ListItemButton>
                              ),
                           )}
                     </List>
                  )}
               </Box>
            </Paper>
         </Grid>
         <Grid size={{ xs: 12, md: 6 }}>
            {selectedSchema && (
               <Paper sx={{ p: 2 }}>
                  <TablesInSchema
                     connectionName={connectionName}
                     schemaName={selectedSchema}
                     onTableClick={(tableName) => {
                        setSelectedTable(tableName);
                     }}
                  />
               </Paper>
            )}
         </Grid>
         {selectedTable && (
            <TableViewer
               connectionName={connectionName}
               schemaName={selectedSchema}
               tableName={selectedTable}
               onClose={() => setSelectedTable(undefined)}
            />
         )}
      </Grid>
   );
}

type TableViewerProps = {
   connectionName: string;
   schemaName: string;
   tableName: string;
   onClose: () => void;
};

function TableViewer({
   connectionName,
   schemaName,
   tableName,
   onClose,
}: TableViewerProps) {
   const { projectName } = useProject();

   const { data, isSuccess, isError, error, isLoading } = useQueryWithApiError({
      queryKey: [
         "tablePathSchema",
         projectName,
         connectionName,
         schemaName,
         tableName,
      ],
      queryFn: (config) =>
         connectionsApi.getTablesource(
            projectName,
            connectionName,
            tableName,
            `${schemaName}.${tableName}`,
            config,
         ),
   });

   if (isSuccess && data) {
      console.log(data);
   }

   return (
      <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
         <DialogTitle>
            <Typography
               fontSize="large"
               variant="body2"
               fontFamily="monospace"
               component="span"
               style={{ textTransform: "uppercase" }}
            >
               {schemaName}.{tableName}
            </Typography>
            <IconButton
               aria-label="close"
               onClick={onClose}
               sx={{ position: "absolute", right: 8, top: 8 }}
            >
               <Box
                  sx={{
                     width: 24,
                     height: 24,
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                  }}
               >
                  X
               </Box>
            </IconButton>
         </DialogTitle>
         <DialogContent>
            {isLoading && <Loading text="Fetching Table Details..." />}
            {isError && (
               <ApiErrorDisplay
                  error={error}
                  context={`${projectName} > ${connectionName} > ${schemaName}.${tableName}`}
               />
            )}
            {isSuccess && data && (
               <TableContainer>
                  <Table
                     size="small"
                     sx={{ "& .MuiTableCell-root": { padding: "10px" } }}
                  >
                     <TableHead>
                        <TableRow>
                           <TableCell>NAME</TableCell>
                           <TableCell>TYPE</TableCell>
                        </TableRow>
                     </TableHead>
                     <TableBody>
                        {data.data.columns?.map(
                           (column: { name: string; type: string }) => (
                              <TableRow key={column.name}>
                                 <TableCell>{column.name}</TableCell>
                                 <TableCell>{column.type}</TableCell>
                              </TableRow>
                           ),
                        )}
                     </TableBody>
                  </Table>
               </TableContainer>
            )}
         </DialogContent>
      </Dialog>
   );
}

interface TablesInSchemaProps {
   connectionName: string;
   schemaName: string;
   onTableClick: (tableName: string) => void;
}

function TablesInSchema({
   connectionName,
   schemaName,
   onTableClick,
}: TablesInSchemaProps) {
   const { projectName } = useProject();

   const { data, isSuccess, isError, error, isLoading } = useQueryWithApiError({
      queryKey: ["tablesInSchema", projectName, connectionName, schemaName],
      queryFn: (config) =>
         connectionsApi.listTables(
            projectName,
            connectionName,
            schemaName,
            config,
         ),
   });

   return (
      <>
         <Typography variant="overline" fontWeight="bold">
            Tables in {schemaName}
         </Typography>
         <Divider />
         <Box sx={{ mt: "10px", maxHeight: "600px", overflowY: "auto" }}>
            {isLoading && <Loading text="Fetching Tables..." />}
            {isError && (
               <ApiErrorDisplay
                  error={error}
                  context={`${projectName} > ${connectionName} > ${schemaName}`}
               />
            )}
            {isSuccess && data.data.length === 0 && (
               <Typography variant="body2">No Tables</Typography>
            )}
            {isSuccess && data.data.length > 0 && (
               <List dense disablePadding>
                  {data.data.map((tableName: string) => (
                     <ListItemButton
                        key={tableName}
                        onClick={() => onTableClick(tableName)}
                     >
                        <ListItemText primary={tableName} />
                     </ListItemButton>
                  ))}
               </List>
            )}
         </Box>
      </>
   );
}
