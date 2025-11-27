import { execSync } from "child_process";

/**
 * Runs prettier on generated files
 */
export const prettify = (path: string, files: string[]) => {
  execSync(`prettier --write ${files.map((f) => `"${path}/${f}"`).join(" ")}`, {
    stdio: "inherit",
  });
};
