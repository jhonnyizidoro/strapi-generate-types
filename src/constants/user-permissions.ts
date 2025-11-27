import { getUsersInterface } from "../get-users-interface";
import { getConfig } from "../utils/get-config";

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

export const userPermissionsStrapiInterfaces = usersEnabled
  ? [role, permission, (await getUsersInterface()) || user]
  : [];
