import { strapiInterfaces } from "./constants/interfaces";
import { createComponentInterface } from "./create-component-interface";
import { createNamespace } from "./create-namespace";
import { createApiInterface } from "./create-api-interface";
import { createRoutesEnum } from "./create-routes-enum";
import { prettify } from "./utils/prettify";
import { getConfig } from "./utils/get-config";
import { getCustomInterfaces } from "./get-custom-interfaces";
import { getApiSchemas } from "./file-system/get-api-schemas";
import { getComponentsSchemas } from "./file-system/get-components.schemas";
import { exists } from "./file-system/exists";
import { createDir } from "./file-system/create-dir";
import { userPermissionsStrapiInterfaces } from "./constants/user-permissions";

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
    ...getCustomInterfaces(),
  ],
  "Strapi"
);

prettify(cfg.outputDir, [
  "Api.d.ts",
  "Components.d.ts",
  "Strapi.d.ts",
  "Routes.ts",
]);
