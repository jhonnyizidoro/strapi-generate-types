import { Config } from "../types";
import { getCLIArgument as CLI } from "./get-cli-argument";
import { getFileIfExists } from "../file-system/get-file-if-exists";
import { parseJSON } from "./parse-json";

let config: Config | undefined;

/**
 * Get config from config file or CLI arguments
 */
export const getConfig = async () => {
  if (config) {
    return config;
  }

  const filename = CLI("config") || "strapi-types-generate.json";
  const configJSON = await getFileIfExists(filename);
  const cfg = parseJSON(configJSON) || {};

  const outputDir = CLI("outputDir") || cfg?.outputDir || "./@types";
  const strapiDir = CLI("strapiDir") || cfg?.strapiDir || ".";
  const dateType = CLI("dateType") || cfg?.dateType || "string";
  const packageJSON = await getFileIfExists(`${strapiDir}/package.json`);
  const usersEnabled = !!packageJSON?.includes("plugin-users-permissions");
  const customFields =
    parseJSON(CLI("customFields")) || cfg?.customFields || {};

  const localConfig: Config = {
    outputDir: outputDir,
    strapiDir: strapiDir,
    strapiApiDir: `${strapiDir}/src/api`,
    strapiComponentsDir: `${strapiDir}/src/components`,
    dateType: dateType,
    customFields: customFields,
    usersEnabled,
  };

  config = localConfig;

  return localConfig;
};
