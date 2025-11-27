import { readdir, stat } from "node:fs/promises";
import { exists } from "./exists";

/**
 * Returns all subdirectories inside a given path.
 */
export const getSubdirectories = async (path: string) => {
  if (!(await exists(path))) {
    return [];
  }

  const content = await readdir(path);
  const directories: string[] = [];

  await Promise.all(
    content.map(async (item) => {
      const isDir = (await stat(`${path}/${item}`)).isDirectory();
      if (isDir) {
        directories.push(`${path}/${item}`);
      }
    })
  );

  return directories;
};
