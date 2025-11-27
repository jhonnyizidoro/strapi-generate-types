import { Attribute } from "../types";

/**
 * Check if attribute is nullable in Strapi
 */
export const isNullable = (attribute: Attribute) => {
  return !("required" in attribute) || attribute.required === true;
};
