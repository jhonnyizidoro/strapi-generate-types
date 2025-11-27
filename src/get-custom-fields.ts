import { getConfig } from "./utils/get-config";

const { customFields } = await getConfig();

/**
 * Return the custom fields from config to be used as types on the final interfaces
 *
 * @example
 *
 * Config ->
 * {
 *   "customFields": {
 *     "plugin::color-picker.color": "`#${string}`",
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
 * {
 *   'plugin::color-picker.color': '`#${string}`',
 *   'plugin::strapi-plugin-iconhub.iconhub': 'Strapi.IconHubIcon'
 * }
 */
export const getCustomFields = () => {
  const customFieldMap: Record<string, string> = {};

  Object.entries(customFields).flatMap(([name, type]) => {
    if (typeof type === "string") {
      customFieldMap[name] = type;
    } else {
      customFieldMap[name] = `Strapi.${type.name}`;
    }
  });

  return customFieldMap;
};
