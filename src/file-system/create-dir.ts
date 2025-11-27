import { exists } from "./exists";
import { mkdir } from "node:fs/promises";

/**
 * Recursively create a director with subdirectories
 */
export const createDir = async (path: string) => {
  if (await exists(path)) {
    return;
  }

  await mkdir(path, { recursive: true });
};
