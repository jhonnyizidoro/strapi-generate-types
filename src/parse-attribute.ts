import { getCustomFields } from "./get-custom-fields";
import { Attribute } from "./types";
import { getConfig } from "./utils/get-config";
import { isNullable } from "./utils/is-nullable";
import { titleCase } from "./utils/title-case";

const { dateType } = await getConfig();
const customFields = getCustomFields();

/**
 * Returns a string with the property and it's value
 *
 * @example
 * "url?: null | string;" // string
 * "aspectRatio?: null | '4:3' | '16:9' | '9:16' | '1:1';" // enum
 * "thumbnail?: null | Strapi.Media;" // media
 * "section?: null | (Components.Footer | Components.Header)[];" // dynamic zone
 */
export const parseAttribute = (
  attributeName: string,
  attributeDef: Attribute
) => {
  let key = `${attributeName}?:`;
  let type = "";

  if (isNullable(attributeDef)) {
    key = `${key} null | `;
  }

  // Password (early return because this type is not exposed bt the API)
  if (attributeDef.type === "password") {
    return "";
  }

  // Relation
  else if (attributeDef.type === "relation") {
    const namespace =
      attributeDef.target === "plugin::users-permissions.role"
        ? "Strapi"
        : "Api";
    type = `${namespace}.${titleCase(attributeDef.target.split(/[:.]/g).pop())}`;
    type = attributeDef.relation.endsWith("ToMany") ? `${type}[]` : type;
  }

  // Component
  else if (attributeDef.type === "component") {
    type = `Components.${titleCase(attributeDef.component.split(".").pop())}`;
    type = attributeDef.repeatable ? `${type}[]` : type;
  }

  // Dynamic zone
  else if (attributeDef.type === "dynamiczone") {
    type = `(${attributeDef.components
      .map((c) => `Components.${titleCase(c.split(".").pop())}`)
      .join(" | ")})[]`;
  }

  // Media
  else if (attributeDef.type === "media") {
    type = "Strapi.Media";
    type = attributeDef.multiple ? `${type}[]` : type;
  }

  // Enumeration
  else if (attributeDef.type === "enumeration") {
    type = attributeDef.enum.map((v) => `'${v}'`).join(" | ");
  }

  // Text, RichText, Email, UID
  else if (
    attributeDef.type === "string" ||
    attributeDef.type === "text" ||
    attributeDef.type === "richtext" ||
    attributeDef.type === "email" ||
    attributeDef.type === "uid" ||
    attributeDef.type === "blocks"
  ) {
    type = "string";
  }

  // Json
  else if (attributeDef.type === "json") {
    type = "any";
  }

  // Number
  else if (
    attributeDef.type === "integer" ||
    attributeDef.type === "biginteger" ||
    attributeDef.type === "decimal" ||
    attributeDef.type === "float"
  ) {
    type = "number";
  }

  // Date
  else if (
    attributeDef.type === "date" ||
    attributeDef.type === "datetime" ||
    attributeDef.type === "time"
  ) {
    type = dateType;
  }

  // Boolean
  else if (attributeDef.type === "boolean") {
    type = "boolean";
  }

  // Custom field
  else if (attributeDef.type === "customField") {
    type = customFields[attributeDef.customField] || "unknown";
  }

  // Others
  else {
    type = "unknown";
  }

  return `${key} ${type};\n`;
};
