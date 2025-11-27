import { getConfig } from "../utils/get-config";
import { getSubdirectories } from "./get-subdirectories";

const config = await getConfig();

/**
 * Returns a list of JSON schemas for each API route.
 *
 * @example
 * [
 *   "src/api/<collection-name>/content-types/<collection-name>/schema.json",
 *   "src/api/<single-type-name>/content-types/<single-type-name>/schema.json",
 * ]
 */
export const getApiSchemas = async () => {
  const apiFolders = await getSubdirectories(config.strapiApiDir);
  return apiFolders
    .map((f) => `${f}/content-types/${f.split("/").pop()}/schema.json`)
    .sort((a, b) => a.localeCompare(b, "en"));
};
