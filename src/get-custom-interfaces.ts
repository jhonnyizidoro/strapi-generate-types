import { getConfig } from "./utils/get-config";

const { customFields } = await getConfig();

/**
 * Return the interfaces for custom fields from config
 *
 * @example
 *
 * Config ->
 * {
 *   "customFields": {
 *     "plugin::color-picker.color": "`#${string}`", // this will be ignored since it's a simple type
 *     "plugin::strapi-plugin-iconhub.iconhub": {
 *       "name": "IconHubIcon",
 *       "attributes": {
 *         "svg": "string",
 *       }
 *     }
 *   }
 * }
 *
 * Returns ->
 * [
 *   "interface IconHubIcon\n"
 *     "svg?: string,\n"
 *   "}"
 * ]
 */
export const getCustomInterfaces = () => {
  return Object.entries(customFields).flatMap(([, type]) => {
    if (typeof type === "string") {
      return [];
    }

    const i = JSON.stringify(type.attributes, null, 2)
      .replace(/(["'])([a-zA-Z0-9_]+)\1(?=\s*:)/g, "$2")
      .replace(/:\s*(["'])([^"']+)\1/g, ": $2")
      .replace(/([a-zA-Z0-9_]+)\s*:\s*/g, "$1?: ");

    return [`interface ${type.name} ${i}`];
  });
};
