import { readFile } from "node:fs/promises";
import { exists } from "./exists";

/**
 * Returns file content if the file exists.
 */
export const getFileIfExists = async (path: string) => {
  if (!(await exists(path))) {
    return;
  }

  return await readFile(path, "utf-8");
};
