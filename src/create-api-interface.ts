import { parseAttribute } from "./parse-attribute";
import { Attribute, TypeSchema } from "./types";
import { readFile } from "node:fs/promises";
import { titleCase } from "./utils/title-case";

/**
 * Generate a collection or single-type interface
 *
 * @example
 *
 * schemaPath -> "src/api/tag/content-types/tag/schema.json"
 *
 * interface Tag {
 *   id?: number;
 *   documentId?: string;
 *   // ...properties from schema.json
 * }
 */
export const createApiInterface = async (schemaPath: string) => {
  const interfaceName = titleCase(schemaPath.split("/").at(-2));
  let tsInterface = `\ninterface ${interfaceName} {\n id?: number;\n documentId?: string;\n`;
  const schemaFile = await readFile(schemaPath, "utf-8");
  const schema = JSON.parse(schemaFile) as TypeSchema;
  const attributes = Object.entries(schema.attributes) as [string, Attribute][];

  for (let [attributeName, attributeDef] of attributes) {
    tsInterface += parseAttribute(attributeName, attributeDef);
  }

  if (schema.pluginOptions?.i18n?.localized) {
    tsInterface += `\nlocale: string;\nlocalizations?: { data: ${interfaceName}[] }`;
  }

  tsInterface += `}\n`;

  return tsInterface;
};
