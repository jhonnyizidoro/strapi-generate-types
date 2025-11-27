import { getConfig } from "../utils/get-config";
import { getSubdirectories } from "./get-subdirectories";
import { getFiles } from "./get-files";

const config = await getConfig();

/**
 * Returns a list of JSON schemas for each component.
 *
 * @example
 * [
 *   "src/components/<component-category>/<component-name>.json"
 * ]
 */
export const getComponentsSchemas = async () => {
  const componentCategoryFolders = await getSubdirectories(
    config.strapiComponentsDir
  );

  return (
    await Promise.all(componentCategoryFolders.map((f) => getFiles(f)))
  ).flat();
};
