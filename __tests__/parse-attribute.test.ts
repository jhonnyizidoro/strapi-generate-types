import { describe, it, expect, vi } from "vitest";

vi.mock("../src/utils/get-config", () => ({
  getConfig: vi.fn().mockResolvedValue({
    dateType: "string",
    outputDir: "./@types",
    strapiDir: ".",
    strapiApiDir: "./src/api",
    strapiComponentsDir: "./src/components",
    usersEnabled: false,
    customFields: {},
  }),
}));
vi.mock("../src/get-custom-fields", () => ({
  getCustomFields: vi.fn().mockReturnValue({
    "plugin::color-picker.color": "`#${string}`",
    "plugin::iconhub.icon": "Strapi.IconHubIcon",
  }),
}));

import { parseAttribute } from "../src/parse-attribute";

describe("parseAttribute", () => {
  it("returns empty string for password type", () => {
    expect(parseAttribute("secret", { type: "password" })).toBe("");
  });

  it("handles string type (nullable)", () => {
    expect(parseAttribute("title", { type: "string" })).toBe(
      "title?: null |  string;\n"
    );
  });

  it("handles string type (non-nullable with required: false)", () => {
    expect(parseAttribute("title", { type: "string", required: false })).toBe(
      "title?: string;\n"
    );
  });

  it("handles text type", () => {
    const result = parseAttribute("body", { type: "text" });
    expect(result).toContain("string");
  });

  it("handles richtext type", () => {
    const result = parseAttribute("content", { type: "richtext" });
    expect(result).toContain("string");
  });

  it("handles email type", () => {
    const result = parseAttribute("email", { type: "email" });
    expect(result).toContain("string");
  });

  it("handles uid type", () => {
    const result = parseAttribute("slug", { type: "uid" });
    expect(result).toContain("string");
  });

  it("handles blocks type", () => {
    const result = parseAttribute("blocks", { type: "blocks" });
    expect(result).toContain("string");
  });

  it("handles json type", () => {
    const result = parseAttribute("meta", { type: "json" });
    expect(result).toContain("any");
  });

  it("handles integer type", () => {
    const result = parseAttribute("count", { type: "integer" });
    expect(result).toContain("number");
  });

  it("handles biginteger type", () => {
    const result = parseAttribute("bigNum", { type: "biginteger" });
    expect(result).toContain("number");
  });

  it("handles decimal type", () => {
    const result = parseAttribute("price", { type: "decimal" });
    expect(result).toContain("number");
  });

  it("handles float type", () => {
    const result = parseAttribute("ratio", { type: "float" });
    expect(result).toContain("number");
  });

  it("handles boolean type", () => {
    const result = parseAttribute("active", { type: "boolean" });
    expect(result).toContain("boolean");
  });

  it("handles date type using configured dateType", () => {
    const result = parseAttribute("createdAt", { type: "date" });
    expect(result).toContain("string");
  });

  it("handles datetime type", () => {
    const result = parseAttribute("publishedAt", { type: "datetime" });
    expect(result).toContain("string");
  });

  it("handles time type", () => {
    const result = parseAttribute("startTime", { type: "time" });
    expect(result).toContain("string");
  });

  it("handles enumeration type", () => {
    const result = parseAttribute("status", {
      type: "enumeration",
      enum: ["draft", "published", "archived"],
    });
    expect(result).toContain("'draft'");
    expect(result).toContain("'published'");
    expect(result).toContain("'archived'");
  });

  it("handles media single", () => {
    const result = parseAttribute("cover", {
      type: "media",
      multiple: false,
      allowedTypes: ["images"],
    });
    expect(result).toContain("Strapi.Media");
    expect(result).not.toContain("[]");
  });

  it("handles media multiple", () => {
    const result = parseAttribute("gallery", {
      type: "media",
      multiple: true,
      allowedTypes: ["images"],
    });
    expect(result).toContain("Strapi.Media[]");
  });

  it("handles oneToOne relation", () => {
    const result = parseAttribute("author", {
      type: "relation",
      target: "api::author.author",
      relation: "oneToOne",
    });
    expect(result).toContain("Api.Author");
    expect(result).not.toContain("[]");
  });

  it("handles oneToMany relation (array)", () => {
    const result = parseAttribute("tags", {
      type: "relation",
      target: "api::tag.tag",
      relation: "oneToMany",
    });
    expect(result).toContain("Api.Tag[]");
  });

  it("handles manyToOne relation", () => {
    const result = parseAttribute("category", {
      type: "relation",
      target: "api::category.category",
      relation: "manyToOne",
    });
    expect(result).toContain("Api.Category");
    expect(result).not.toContain("[]");
  });

  it("handles manyToMany relation (array)", () => {
    const result = parseAttribute("tags", {
      type: "relation",
      target: "api::tag.tag",
      relation: "manyToMany",
    });
    expect(result).toContain("Api.Tag[]");
  });

  it("handles role relation with Strapi namespace", () => {
    const result = parseAttribute("role", {
      type: "relation",
      target: "plugin::users-permissions.role",
      relation: "oneToOne",
    });
    expect(result).toContain("Strapi.Role");
  });

  it("handles non-repeatable component", () => {
    const result = parseAttribute("header", {
      type: "component",
      component: "layout.main-header",
      repeatable: false,
    });
    expect(result).toContain("Components.MainHeader");
    expect(result).not.toContain("[]");
  });

  it("handles repeatable component (array)", () => {
    const result = parseAttribute("sections", {
      type: "component",
      component: "layout.section",
      repeatable: true,
    });
    expect(result).toContain("Components.Section[]");
  });

  it("handles dynamic zone with multiple components", () => {
    const result = parseAttribute("content", {
      type: "dynamiczone",
      components: ["layout.hero", "layout.text-block"],
    });
    expect(result).toContain("Components.Hero");
    expect(result).toContain("Components.TextBlock");
    expect(result).toContain("[]");
  });

  it("handles custom field with string type", () => {
    const result = parseAttribute("color", {
      type: "customField",
      customField: "plugin::color-picker.color",
    });
    expect(result).toContain("`#${string}`");
  });

  it("handles custom field with object type", () => {
    const result = parseAttribute("icon", {
      type: "customField",
      customField: "plugin::iconhub.icon",
    });
    expect(result).toContain("Strapi.IconHubIcon");
  });

  it("handles unknown custom field as 'unknown'", () => {
    const result = parseAttribute("field", {
      type: "customField",
      customField: "plugin::unknown.field",
    });
    expect(result).toContain("unknown");
  });

  it("includes attribute name in output", () => {
    const result = parseAttribute("myField", { type: "boolean" });
    expect(result).toContain("myField?:");
  });

  it("ends with newline", () => {
    const result = parseAttribute("title", { type: "string" });
    expect(result).toMatch(/\n$/);
  });
});
