import { readdir, stat } from "node:fs/promises";
import { exists } from "./exists";

/**
 * Returns all files inside a given path.
 */
export const getFiles = async (path: string) => {
  if (!(await exists(path))) {
    return [];
  }

  const content = await readdir(path);
  const files: string[] = [];

  await Promise.all(
    content.map(async (item) => {
      const isFile = !(await stat(`${path}/${item}`)).isDirectory();
      if (isFile) {
        files.push(`${path}/${item}`);
      }
    })
  );

  return files;
};
