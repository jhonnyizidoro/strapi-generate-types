#!/usr/bin/env node
import { access, readFile, writeFile, readdir, stat, mkdir } from 'node:fs/promises';
import { execSync } from 'child_process';

const getCLIArgument = (argument) => {
  return process.argv.find((arg) => arg.startsWith(`--${argument}`))?.replace(`--${argument}=`, "");
};

const exists = async (path, opts) => {
  try {
    await access(path);
    return true;
  } catch {
    if (opts?.dieOnError) {
      const msg = `Unable to access directory ${path}, please provide proper configuration and make sure the directory exists.`;
      console.log(`\x1B[31m${msg}\x1B[0m`);
      process.exit();
    }
    return false;
  }
};

const getFileIfExists = async (path) => {
  if (!await exists(path)) {
    return;
  }
  return await readFile(path, "utf-8");
};

const parseJSON = (string = "") => {
  try {
    const obj = JSON.parse(string);
    if (typeof obj === "object") {
      return obj;
    } else {
      return {};
    }
  } catch {
  }
};

let config$2;
const getConfig = async () => {
  if (config$2) {
    return config$2;
  }
  const filename = getCLIArgument("config") || "strapi-types-generate.json";
  const configJSON = await getFileIfExists(filename);
  const cfg = parseJSON(configJSON) || {};
  const outputDir = getCLIArgument("outputDir") || cfg?.outputDir || "./@types";
  const strapiDir = getCLIArgument("strapiDir") || cfg?.strapiDir || ".";
  const dateType = getCLIArgument("dateType") || cfg?.dateType || "string";
  const packageJSON = await getFileIfExists(`${strapiDir}/package.json`);
  const usersEnabled = !!packageJSON?.includes("plugin-users-permissions");
  const customFields = parseJSON(getCLIArgument("customFields")) || cfg?.customFields || {};
  const localConfig = {
    outputDir,
    strapiDir,
    strapiApiDir: `${strapiDir}/src/api`,
    strapiComponentsDir: `${strapiDir}/src/components`,
    dateType,
    customFields,
    usersEnabled
  };
  config$2 = localConfig;
  return localConfig;
};

const { dateType: dateType$2 } = await getConfig();
const payload = `
  interface Payload<T> {
    data: T;
    error?: {
        status: number,
        name: 'NotFoundError',
        message: 'Not Found',
        details: unknown
    };
    meta?: {
      pagination?: {
        page: number; 
        pageSize: number;
        pageCount: number;
        total: number;
      }
    };
  }
`;
const mediaFormat = `
  interface MediaFormat {
    name?: string;
    hash?: string;
    ext?: string;
    mime?: string;
    width?: number;
    height?: number;
    size?: number;
    path?: string;
    url?: string;
    sizeInBytes?: number
  }
`;
const media = `
  interface Media {
    id?: number;
    name?: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
    formats?: { thumbnail: MediaFormat; medium: MediaFormat; small: MediaFormat; };
    hash?: string;
    ext?: string;
    mime?: string;
    size?: number;
    url?: string;
    previewUrl?: string;
    provider?: string;
    createdAt?: ${dateType$2};
    updatedAt?: ${dateType$2};
    publishedAt?: ${dateType$2};
    provider_metadata?: unknown
  }
`;
const strapiInterfaces = [payload, mediaFormat, media].filter(
  (s) => typeof s === "string"
);

const { customFields: customFields$2 } = await getConfig();
const getCustomFields = () => {
  const customFieldMap = {};
  Object.entries(customFields$2).flatMap(([name, type]) => {
    if (typeof type === "string") {
      customFieldMap[name] = type;
    } else {
      customFieldMap[name] = `Strapi.${type.name}`;
    }
  });
  return customFieldMap;
};

const isNullable = (attribute) => {
  return !("required" in attribute) || attribute.required === true;
};

const titleCase = (str = "") => {
  const words = str.match(/[a-z]+/gi) || [];
  return words.map(
    (word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()
  ).join("");
};

const { dateType: dateType$1 } = await getConfig();
const customFields$1 = getCustomFields();
const parseAttribute = (attributeName, attributeDef) => {
  let key = `${attributeName}?:`;
  let type = "";
  if (isNullable(attributeDef)) {
    key = `${key} null | `;
  }
  if (attributeDef.type === "password") {
    return "";
  } else if (attributeDef.type === "relation") {
    const namespace = attributeDef.target === "plugin::users-permissions.role" ? "Strapi" : "Api";
    type = `${namespace}.${titleCase(attributeDef.target.split(/[:.]/g).pop())}`;
    type = attributeDef.relation.endsWith("ToMany") ? `${type}[]` : type;
  } else if (attributeDef.type === "component") {
    type = `Components.${titleCase(attributeDef.component.split(".").pop())}`;
    type = attributeDef.repeatable ? `${type}[]` : type;
  } else if (attributeDef.type === "dynamiczone") {
    type = `(${attributeDef.components.map((c) => `Components.${titleCase(c.split(".").pop())}`).join(" | ")})[]`;
  } else if (attributeDef.type === "media") {
    type = "Strapi.Media";
    type = attributeDef.multiple ? `${type}[]` : type;
  } else if (attributeDef.type === "enumeration") {
    type = attributeDef.enum.map((v) => `'${v}'`).join(" | ");
  } else if (attributeDef.type === "string" || attributeDef.type === "text" || attributeDef.type === "richtext" || attributeDef.type === "email" || attributeDef.type === "uid" || attributeDef.type === "blocks") {
    type = "string";
  } else if (attributeDef.type === "json") {
    type = "any";
  } else if (attributeDef.type === "integer" || attributeDef.type === "biginteger" || attributeDef.type === "decimal" || attributeDef.type === "float") {
    type = "number";
  } else if (attributeDef.type === "date" || attributeDef.type === "datetime" || attributeDef.type === "time") {
    type = dateType$1;
  } else if (attributeDef.type === "boolean") {
    type = "boolean";
  } else if (attributeDef.type === "customField") {
    type = customFields$1[attributeDef.customField] || "unknown";
  } else {
    type = "unknown";
  }
  return `${key} ${type};
`;
};

const createComponentInterface = async (schemaPath) => {
  const componentFullName = `${schemaPath.split(/[/.]/g).at(-3)}.${schemaPath.split(/[/.]/g).at(-2)}`;
  const interfaceName = titleCase(componentFullName.split(".")[1]);
  let tsInterface = `
interface ${interfaceName} {
__component?: '${componentFullName}'
id?: number;
`;
  const schemaFile = await readFile(schemaPath, "utf8");
  const schema = JSON.parse(schemaFile);
  const attributes = Object.entries(schema.attributes);
  for (const [attributeName, attributeDef] of attributes) {
    tsInterface += parseAttribute(attributeName, attributeDef);
  }
  tsInterface += "}\n";
  return tsInterface;
};

const { outputDir: outputDir$1 } = await getConfig();
const createNamespace = async (content, nsName) => {
  let ns = `declare namespace ${nsName} { ${content.join("\n")} }`;
  await writeFile(`${outputDir$1}/${nsName}.d.ts`, ns);
};

const createApiInterface = async (schemaPath) => {
  const interfaceName = titleCase(schemaPath.split("/").at(-2));
  let tsInterface = `
interface ${interfaceName} {
 id?: number;
 documentId?: string;
`;
  const schemaFile = await readFile(schemaPath, "utf-8");
  const schema = JSON.parse(schemaFile);
  const attributes = Object.entries(schema.attributes);
  for (let [attributeName, attributeDef] of attributes) {
    tsInterface += parseAttribute(attributeName, attributeDef);
  }
  if (schema.pluginOptions?.i18n?.localized) {
    tsInterface += `
locale: string;
localizations?: { data: ${interfaceName}[] }`;
  }
  tsInterface += `}
`;
  return tsInterface;
};

const getSubdirectories = async (path) => {
  if (!await exists(path)) {
    return [];
  }
  const content = await readdir(path);
  const directories = [];
  await Promise.all(
    content.map(async (item) => {
      const isDir = (await stat(`${path}/${item}`)).isDirectory();
      if (isDir) {
        directories.push(`${path}/${item}`);
      }
    })
  );
  return directories;
};

const config$1 = await getConfig();
const getApiSchemas = async () => {
  const apiFolders = await getSubdirectories(config$1.strapiApiDir);
  return apiFolders.map(
    (f) => `${f}/content-types/${f.split("/").pop()}/schema.json`
  );
};

const { usersEnabled: usersEnabled$1, outputDir } = await getConfig();
const createRoutesEnum = async () => {
  const schemas = await getApiSchemas();
  let enumType = `export enum StrapiRoute {
`;
  for (const s of schemas) {
    const schemaJSON = await readFile(s, "utf-8");
    const schema = JSON.parse(schemaJSON);
    const schemaName = s.split("/").at(-2);
    const isCollection = schema.kind === "collectionType";
    if (isCollection) {
      enumType += `${titleCase(schemaName)} = '${schema.info.pluralName}',
`;
      enumType += `${titleCase(schemaName)}Document = '${schema.info.pluralName}/{documentId}',
`;
    } else {
      enumType += `${titleCase(schemaName)} = '${schema.info.singularName}',
`;
    }
  }
  if (usersEnabled$1) {
    enumType += `Users = 'users',
`;
    enumType += `UsersDocument = 'users/{documentId}',
`;
  }
  enumType += "}\n";
  await writeFile(`${outputDir}/Routes.ts`, enumType);
};

const prettify = (path, files) => {
  execSync(`prettier --write ${files.map((f) => `"${path}/${f}"`).join(" ")}`, {
    stdio: "inherit"
  });
};

const { customFields } = await getConfig();
const getCustomInterfaces = () => {
  return Object.entries(customFields).flatMap(([, type]) => {
    if (typeof type === "string") {
      return [];
    }
    const i = JSON.stringify(type.attributes, null, 2).replace(/(["'])([a-zA-Z0-9_]+)\1(?=\s*:)/g, "$2").replace(/:\s*(["'])([^"']+)\1/g, ": $2").replace(/([a-zA-Z0-9_]+)\s*:\s*/g, "$1?: ");
    return [`interface ${type.name} ${i}`];
  });
};

const getFiles = async (path) => {
  if (!await exists(path)) {
    return [];
  }
  const content = await readdir(path);
  const files = [];
  await Promise.all(
    content.map(async (item) => {
      const isFile = !(await stat(`${path}/${item}`)).isDirectory();
      if (isFile) {
        files.push(`${path}/${item}`);
      }
    })
  );
  return files;
};

const config = await getConfig();
const getComponentsSchemas = async () => {
  const componentCategoryFolders = await getSubdirectories(
    config.strapiComponentsDir
  );
  return (await Promise.all(componentCategoryFolders.map((f) => getFiles(f)))).flat();
};

const createDir = async (path) => {
  if (await exists(path)) {
    return;
  }
  await mkdir(path, { recursive: true });
};

const { strapiDir } = await getConfig();
const getUsersInterface = async () => {
  const schemaPath = `${strapiDir}/src/extensions/users-permissions/content-types/user/schema.json`;
  if (!await exists(schemaPath)) {
    return;
  }
  return await createApiInterface(schemaPath);
};

const { usersEnabled, dateType } = await getConfig();
const role = `
  interface Role {
    id?: number,
    documentId?: string
    name?: string
    description?: string
    type?: string
    createdAt?: string
    updatedAt?: string
    publishedAt?: string
    permissions?: Strapi.Permission[]
  };
`;
const permission = `
  interface Permission {
    id?: number,
    documentId?: string,
    action?: string,
    createdAt?: ${dateType},
    updatedAt?: ${dateType},
    publishedAt?: ${dateType},
    role?: Strapi.Role,
  };
`;
const user = `
  interface User {
    id?: number;
    documentId?: string;
    username?: string;
    email?: string;
    provider?: string;
    confirmed?: boolean;
    blocked?: boolean;
    createdAt?: ${dateType};
    updatedAt?: ${dateType};
    publishedAt?: ${dateType};
    role?: Strapi.Role;
  }
`;
const userPermissionsStrapiInterfaces = usersEnabled ? [role, permission, await getUsersInterface() || user] : [];

const cfg = await getConfig();
await exists(cfg.strapiDir, { dieOnError: true });
const apiSchemas = await getApiSchemas();
const componentSchemas = await getComponentsSchemas();
const apiInterfaces = await Promise.all(
  apiSchemas.map((s) => createApiInterface(s))
);
const componentsInterfaces = await Promise.all(
  componentSchemas.map((s) => createComponentInterface(s))
);
await createDir(cfg.outputDir);
await createRoutesEnum();
await createNamespace(apiInterfaces, "Api");
await createNamespace(componentsInterfaces, "Components");
await createNamespace(
  [
    ...strapiInterfaces,
    ...userPermissionsStrapiInterfaces,
    ...getCustomInterfaces()
  ],
  "Strapi"
);
prettify(cfg.outputDir, [
  "Api.d.ts",
  "Components.d.ts",
  "Strapi.d.ts",
  "Routes.ts"
]);
