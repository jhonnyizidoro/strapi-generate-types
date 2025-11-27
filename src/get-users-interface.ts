import { createApiInterface } from "./create-api-interface";
import { exists } from "./file-system/exists";
import { getConfig } from "./utils/get-config";

const { strapiDir } = await getConfig();

export const getUsersInterface = async () => {
  const schemaPath = `${strapiDir}/src/extensions/users-permissions/content-types/user/schema.json`;

  if (!(await exists(schemaPath))) {
    return;
  }

  return await createApiInterface(schemaPath);
};
