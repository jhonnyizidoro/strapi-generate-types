import { access } from "node:fs/promises";

/**
 * Check if a file exists.
 * If `dieOnError = true` exist the process if the file is not found
 */
export const exists = async (path: string, opts?: { dieOnError?: boolean }) => {
  try {
    await access(path);
    return true;
  } catch {
    if (opts?.dieOnError) {
      console.log(path);

      const msg = `Unable to access directory ${path}, please provide proper configuration and make sure the directory exists.`;
      console.log(`\x1b[31m${msg}\x1b[0m`);
      process.exit();
    }

    return false;
  }
};
