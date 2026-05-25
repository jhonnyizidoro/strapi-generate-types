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
        attributes: { svg: "string", name: "string" },
      },
    },
  }),
}));

import { getCustomInterfaces } from "../src/get-custom-interfaces";

describe("getCustomInterfaces", () => {
  it("returns empty array for string-type custom fields", () => {
    const interfaces = getCustomInterfaces();
    const hasColorPicker = interfaces.some((i) => i.includes("color-picker"));
    expect(hasColorPicker).toBe(false);
  });

  it("generates interface for object-type custom fields", () => {
    const interfaces = getCustomInterfaces();
    expect(interfaces.length).toBeGreaterThan(0);
    const iconInterface = interfaces.find((i) => i.includes("IconHubIcon"));
    expect(iconInterface).toBeDefined();
  });

  it("interface contains attribute names", () => {
    const interfaces = getCustomInterfaces();
    const iconInterface = interfaces.find((i) => i.includes("IconHubIcon")) ?? "";
    expect(iconInterface).toContain("svg");
    expect(iconInterface).toContain("name");
  });

  it("interface uses optional properties", () => {
    const interfaces = getCustomInterfaces();
    const iconInterface = interfaces.find((i) => i.includes("IconHubIcon")) ?? "";
    expect(iconInterface).toContain("?:");
  });
});
