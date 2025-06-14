import { URLReader } from "@malloydata/malloy";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";

export const PACKAGE_MANIFEST_NAME = "publisher.json";
export const CONNECTIONS_MANIFEST_NAME = "publisher.connections.json";
export const MODEL_FILE_SUFFIX = ".malloy";
export const NOTEBOOK_FILE_SUFFIX = ".malloynb";
// TODO: Move this to server config.
export const ROW_LIMIT = 1000;

export const URL_READER: URLReader = {
   readURL: (url: URL) => {
      let path = url.toString();
      if (url.protocol == "file:") {
         path = fileURLToPath(url);
      }
      return fs.readFile(path, "utf8");
   },
};
