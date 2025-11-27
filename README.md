# Strapi types generate

This library provides a CLI for [Strapi V5](https://strapi.io/) that generates typescript interfaces based on your components, collections and single types. This library supports `dynamic zones`, `components` and `relations`.

## Installation

`pnpm add -D @jmen/strapi-types-generate`

## Configuration file

First, create a `strapi-types-generate.json` file in the root of your project.

You cal also run the CLI providing the path for the config file: `pnpm stg --config=src/config.json`.

Example `strapi-types-generate.json`:

```json
{
  "strapiDir": "backend",
  "outputDir": "frontend/src/@types",
  "dateType": "string",
  "customFields": {
    "plugin::color-picker.color": "`#${string}`",
    "plugin::ckeditor5.CKEditor": "string",
    "plugin::strapi-plugin-iconhub.iconhub": {
      "name": "IconHubIcon",
      "attributes": {
        "iconName": "string",
        "iconData": "string",
        "width": "number",
        "height": "number",
        "isSvgEditable": "boolean",
        "isIconNameEditable": "boolean"
      }
    }
  }
}
```

You can also provide any of the configuration as argument to the CLI.

```shell
pnpm stg --strapiDir='backend' --outputDir='frontend/src/@types' --dateType='Date' --customFields='{"plugin::color-picker.color":"`#${string}`","plugin::ckeditor5.CKEditor":"string"}'
```

## Configuration options

| Property       | Type                                                                             | Default value | Description                                                                                                        |
| -------------- | -------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------ |
| `strapiDir`    | `string`                                                                         | `"."`         | Strapi root directory                                                                                              |
| `outputDir`    | `string`                                                                         | `"./@types"`  | Interfaces output directory                                                                                        |
| `dateType`     | `string`                                                                         | `"string"`    | Dates may be returned in different formats depending on how you're fetching data. You may want to use `Date` here. |
| `customFields` | `Record<string, string \| { name: string; attributes: Record<string, unknown> }` | `{}`          | Provide type definition for custom fields.                                                                         |

## Outputs

### Routes.ts

A typescript enum is generated so you can have a type safe fetch function

```typescript
export enum StrapiRoute {
  Footer = "footers",
  FooterDocument = "footers/{documentId}",
  Page = "pages",
  PageDocument = "pages/{documentId}",
  Menu = "menus",
  MenuDocument = "menus/{documentId}",
}

// Example
export const get = async <T>(
  route: StrapiRoute,
  opts?: { documentId?: string }
) => {
  let endpoint = `http://localhost:1337/api/${route}`;

  if (opts?.documentId) {
    endpoint = endpoint.replace("{documentId}", opts?.documentId);
  }

  const res = await fetch(`...`);
  const data = (await res.json()) as Strapi.Payload<T>;
};
```

### Api.d.ts

`Api.d.ts` contains your `collections` and `single types`

```typescript
declare namespace Api {
  interface Menu {
    id?: number;
    documentId?: string;
    logo?: null | Strapi.Media;
  }

  interface Page {
    id?: number;
    documentId?: string;
    url?: null | string;
    sections?: null | (Components.Text | Components.Button)[]; // dynamic zone
    menu?: null | Api.Menu;
  }
}
```

### Components.d.ts

```typescript
declare namespace Components {
  interface Button {
    __component?: "category.button"; // __component is returned in dynamic zones
    id?: number;
    label?: null | string;
    size?: null | "small" | "medium" | "large"; // enum
    backgroundColor?: `#${string}`; // customFields["plugin::color-picker.color"]
    icon?: null | Strapi.IconHubIcon; // customFields["plugin::strapi-plugin-iconhub.iconhub"].name
  }

  interface Text {
    __component?: "category.button"; // __component is returned in dynamic zones
    id?: number;
    content?: null | string; // customFields["plugin::ckeditor5.CKEdito"]
  }
}
```

### Strapi.d.ts

```typescript
declare namespace Strapi {
  interface Payload<T> {
    data: T;
    error?: {
      status: number;
      name: "NotFoundError";
      message: "Not Found";
      details: unknown;
    };
    meta?: {
      pagination?: {
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
      };
    };
  }

  interface MediaFormat {
    //...
  }

  interface Media {
    id?: number;
    formats?: {
      thumbnail: MediaFormat;
      medium: MediaFormat;
      small: MediaFormat;
    };
    //...
  }

  // custom field defined in config
  interface IconHubIcon {
    iconName?: string;
    iconData?: string;
    width?: number;
    height?: number;
    isSvgEditable?: boolean;
    isIconNameEditable?: boolean;
  }

  // Role, Permissions and User is only generated if @strapi/plugin-users-permissions is in package.json
  interface Role {
    id?: number;
    permissions?: Strapi.Permission[];
    // ...
  }

  interface Permission {
    id?: number;
    role?: Strapi.Role;
    // ...
  }

  interface User {
    id?: number;
    documentId?: string;
    username?: null | string;
    email?: null | string;
    provider?: null | string;
    resetPasswordToken?: null | string;
    confirmationToken?: null | string;
    confirmed?: null | boolean;
    blocked?: null | boolean;
    role?: null | Strapi.Role;
  }
}
```
