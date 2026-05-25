import { describe, it, expect, vi } from "vitest";

vi.mock("../src/utils/get-config", () => ({
  getConfig: vi.fn().mockResolvedValue({
    outputDir: "./@types",
    dateType: "string",
    strapiDir: ".",
    strapiApiDir: "./src/api",
    strapiComponentsDir: "./src/components",
    usersEnabled: false,
    customFields: {
      "plugin::color-picker.color": "`#${string}`",
      "plugin::iconhub.icon": {
        name: "IconHubIcon",
        attributes: { svg: "string" },
      },
    },
  }),
}));

import { getCustomFields } from "../src/get-custom-fields";

describe("getCustomFields", () => {
  it("maps string type custom fields directly", () => {
    const fields = getCustomFields();
    expect(fields["plugin::color-picker.color"]).toBe("`#${string}`");
  });

  it("maps object type custom fields to Strapi namespace reference", () => {
    const fields = getCustomFields();
    expect(fields["plugin::iconhub.icon"]).toBe("Strapi.IconHubIcon");
  });

  it("returns a flat map of field name to type string", () => {
    const fields = getCustomFields();
    expect(typeof fields).toBe("object");
    expect(Object.keys(fields)).toHaveLength(2);
  });
});
