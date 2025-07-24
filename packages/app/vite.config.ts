import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { peerDependencies } from "./package.json";

export default ({ mode }) => {
   const isDev = mode === "development";
   // In Dev, Resolve the SDK locally as src, not /dist so it can hot reload
   // But for CSS files, we need to point to dist since they're only generated during build
   const resolve = isDev
      ? {
           alias: {
              // CSS files must come BEFORE the general SDK alias
              "@malloy-publisher/sdk/styles.css": path.resolve(
                 __dirname,
                 "../sdk/dist/styles.css",
              ),
              "@malloy-publisher/sdk/malloy-explorer.css": path.resolve(
                 __dirname,
                 "../sdk/dist/malloy-explorer.css",
              ),
              "@malloy-publisher/sdk/markdown-editor.css": path.resolve(
                 __dirname,
                 "../sdk/dist/markdown-editor.css",
              ),
              // General SDK alias for everything else
              "@malloy-publisher/sdk": path.resolve(__dirname, "../sdk/src"),
           },
        }
      : undefined;

   // Check if we're building as a library
   const isLibraryBuild = process.env.BUILD_MODE === "library";

   if (isLibraryBuild) {
      return defineConfig({
         plugins: [react(), dts()],
         define: {
            // This is REQUIRED for React and other libraries to eliminate debug code
            "process.env.NODE_ENV": JSON.stringify(mode),
            "process.env.NODE_DEBUG": "false",
         },
         build: {
            minify: mode === "production",
            lib: {
               entry: "./src/index.ts",
               name: "@malloy-publisher/app",
               fileName: (format) => `index.${format}.js`,
               formats: ["cjs", "es"],
            },
            rollupOptions: {
               onwarn(warning, warn) {
                  if (
                     warning.code === "MODULE_LEVEL_DIRECTIVE" ||
                     warning.code === "SOURCEMAP_ERROR"
                  ) {
                     return;
                  }
                  warn(warning);
               },
               // Externalize ALL React ecosystem and large dependencies for library build
               external: [
                  // React core
                  "react",
                  "react-dom",
                  "react/jsx-runtime",
                  "react-dom/client",

                  // React ecosystem
                  "@emotion/react",
                  "@emotion/styled",

                  // MUI (Material-UI) - these are huge
                  "@mui/material",
                  "@mui/icons-material",
                  "@mui/system",
                  "@mui/x-tree-view",

                  // Other large React libraries
                  "@react-spring/web",
                  "@tanstack/react-query",
                  "@uiw/react-md-editor",

                  // Malloy dependencies (should be provided by host)
                  "@malloydata/malloy-explorer",
                  "@malloydata/malloy-interfaces",
                  "@malloydata/malloy-query-builder",
                  "@malloydata/render",

                  // Utility libraries
                  "axios",
                  "markdown-to-jsx",

                  // All peer dependencies
                  ...Object.keys(peerDependencies),
               ],
               output: {
                  // Provide global variable names for externalized dependencies
                  globals: {
                     react: "React",
                     "react-dom": "ReactDOM",
                     "react/jsx-runtime": "ReactJSXRuntime",
                     "@emotion/react": "EmotionReact",
                     "@emotion/styled": "EmotionStyled",
                     "@mui/material": "MaterialUI",
                     "@mui/icons-material": "MaterialUIIcons",
                     "@mui/system": "MaterialUISystem",
                  },
               },
            },
            sourcemap: mode !== "production",
            emptyOutDir: true,
            chunkSizeWarningLimit: 1000,
            target: "es2020",
         },
         resolve,
      });
   }

   // Regular app build (not library mode) - bundle everything normally
   return defineConfig({
      plugins: [react()],
      define: {
         // This is REQUIRED for React and other libraries to eliminate debug code
         "process.env.NODE_ENV": JSON.stringify(mode),
         // Custom defines for your own code (optional)
         __DEV__: JSON.stringify(mode !== "production"),
         __PROD__: JSON.stringify(mode === "production"),
      },
      build: {
         minify: mode === "production",
         sourcemap: mode !== "production",
         emptyOutDir: true,
         chunkSizeWarningLimit: 1000,
         target: "esnext",
      },
      resolve,
   });
};
