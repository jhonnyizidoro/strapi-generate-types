import { TypeSchema } from "./types";
import { readFile, writeFile } from "node:fs/promises";
import { getConfig } from "./utils/get-config";
import { getApiSchemas } from "./file-system/get-api-schemas";
import { titleCase } from "./utils/title-case";

const { usersEnabled, outputDir } = await getConfig();

/**
 * Creates a typescript `enum` to add routes type safety
 *
 * @example
 *
 * writeFile "./<config.outputDir>/Routes.ts"
 *
 * export enum StrapiRoute {
 *   MySingleType = 'my-single-type',
 *   MyCollection = 'my-collections',
 *   MyCollectionDocument = 'my-collections/{documentId}',
 * }
 */
export const createRoutesEnum = async () => {
  const schemas = await getApiSchemas();
  let enumType = `export enum StrapiRoute {\n`;

  for (const s of schemas) {
    const schemaJSON = await readFile(s, "utf-8");
    const schema = JSON.parse(schemaJSON) as TypeSchema;
    const schemaName = s.split("/").at(-2);

    const isCollection = schema.kind === "collectionType";

    if (isCollection) {
      enumType += `${titleCase(schemaName)} = '${schema.info.pluralName}',\n`;
      enumType += `${titleCase(schemaName)}Document = '${schema.info.pluralName}/{documentId}',\n`;
    } else {
      enumType += `${titleCase(schemaName)} = '${schema.info.singularName}',\n`;
    }
  }

  if (usersEnabled) {
    enumType += `Users = 'users',\n`;
    enumType += `UsersDocument = 'users/{documentId}',\n`;
  }

  enumType += "}\n";

  await writeFile(`${outputDir}/Routes.ts`, enumType);
};
