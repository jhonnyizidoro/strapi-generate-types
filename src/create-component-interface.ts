import { parseAttribute } from "./parse-attribute";
import { ComponentSchema } from "./types";
import { readFile } from "node:fs/promises";
import { titleCase } from "./utils/title-case";

/**
 * Generate a component interface
 *
 * @example
 *
 * schemaPath -> "src/components/header/main-header.json"
 *
 * interface MainHeader {
 *   __component?: 'header.main-header'
 *   id?: number;
 *   // ...properties from main-header.json
 * }
 */
export const createComponentInterface = async (schemaPath: string) => {
  const componentFullName = `${schemaPath.split(/[/.]/g).at(-3)}.${schemaPath.split(/[/.]/g).at(-2)}`;
  const interfaceName = titleCase(componentFullName.split(".")[1]);
  let tsInterface = `\ninterface ${interfaceName} {\n__component?: '${componentFullName}'\nid?: number;\n`;
  const schemaFile = await readFile(schemaPath, "utf8");
  const schema = JSON.parse(schemaFile) as ComponentSchema;

  const attributes = Object.entries(schema.attributes);
  for (const [attributeName, attributeDef] of attributes) {
    tsInterface += parseAttribute(attributeName, attributeDef);
  }

  tsInterface += "}\n";

  return tsInterface;
};
