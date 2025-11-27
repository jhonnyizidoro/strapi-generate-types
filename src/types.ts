export type LocalizationOptions = {
  i18n: {
    localized: boolean;
  };
};

export type SimpleFieldAttributes = {
  private?: boolean;
  pluginOptions?: LocalizationOptions;
  required?: boolean;
};

export type StringAttribute = {
  type:
    | "string"
    | "text"
    | "blocks"
    | "email"
    | "uid"
    | "password"
    | "richtext";
  minLength?: number;
  maxLength?: number;
  regex?: string;
} & SimpleFieldAttributes;

export type ComponentAttribute = {
  required?: boolean;
  type: "component";
  component: `${string}.${string}`;
  repeatable: boolean;
} & SimpleFieldAttributes;

export type DynamicZoneAttribute = {
  required?: boolean;
  type: "dynamiczone";
  components: `${string}.${string}`[];
} & SimpleFieldAttributes;

export type MediaAttribute = {
  required?: boolean;
  type: "media";
  multiple: boolean;
  allowedTypes: ("images" | "files" | "videos" | "audios")[];
} & SimpleFieldAttributes;

export type EnumAttribute = {
  required?: boolean;
  type: "enumeration";
  enum: string[];
} & SimpleFieldAttributes;

export type CustomFieldAttribute = {
  type: "customField";
  customField: string;
  options?: Record<string, unknown>;
} & SimpleFieldAttributes;

export type RelationAttribute = {
  type: "relation";
  target: string;
  relation: "oneToOne" | "oneToMany" | "manyToOne" | "manyToMany";
};

export type JSONAttribute = {
  type: "json";
} & SimpleFieldAttributes;

export type NumberAttribute = {
  type: "integer" | "biginteger" | "decimal" | "float";
} & SimpleFieldAttributes;

export type DateAttribute = {
  type: "date" | "datetime" | "time";
} & SimpleFieldAttributes;

export type BooleanAttribute = {
  type: "boolean";
} & SimpleFieldAttributes;

export type Attribute =
  | StringAttribute
  | ComponentAttribute
  | DynamicZoneAttribute
  | MediaAttribute
  | EnumAttribute
  | CustomFieldAttribute
  | RelationAttribute
  | JSONAttribute
  | NumberAttribute
  | DateAttribute
  | BooleanAttribute;

export type TypeSchema = {
  kind: "collectionType" | "singleType";
  collectionName: string;
  info: {
    singularName: string;
    pluralName: string;
    displayName: string;
  };
  options: { draftAndPublish: true };
  pluginOptions: LocalizationOptions;
  attributes: Record<string, Attribute>;
};

export type ComponentSchema = {
  collectionName: `components_${string}`;
  info: {
    displayName: string;
  };
  options: {};
  config: {};
  attributes: Record<string, Attribute>;
};

export type CustomFieldsConfig = Record<
  string,
  string | { name: string; attributes: Record<string, unknown> }
>;

export type Config = {
  outputDir: string;
  strapiDir: string;
  strapiApiDir: string;
  strapiComponentsDir: string;
  dateType: string;
  usersEnabled: boolean;
  customFields: CustomFieldsConfig;
};
