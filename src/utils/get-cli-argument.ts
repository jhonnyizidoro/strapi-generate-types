/**
 * Returns an argument provided to the CLI
 *
 * @example
 * pnpm stg --strapiDir=backend -> "backend"
 */
export const getCLIArgument = (argument: string) => {
  return process.argv
    .find((arg) => arg.startsWith(`--${argument}`))
    ?.replace(`--${argument}=`, "");
};
