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
  getCustomFields: vi.fn().mockReturnValue({}),
}));
vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

import { readFile } from "node:fs/promises";
import { createComponentInterface } from "../src/create-component-interface";

const makeComponentSchema = (attributes = {}) =>
  JSON.stringify({
    collectionName: "components_header_main",
    info: { displayName: "Main Header" },
    options: {},
    config: {},
    attributes,
  });

describe("createComponentInterface", () => {
  it("generates interface with __component and id", async () => {
    vi.mocked(readFile).mockResolvedValue(makeComponentSchema() as never);
    const result = await createComponentInterface("./src/components/header/main.json");
    expect(result).toContain("interface Main");
    expect(result).toContain("__component?: 'header.main'");
    expect(result).toContain("id?: number");
  });

  it("derives interface name from path (hyphenated → PascalCase per word)", async () => {
    vi.mocked(readFile).mockResolvedValue(makeComponentSchema() as never);
    const result = await createComponentInterface("./src/components/layout/hero-banner.json");
    expect(result).toContain("interface HeroBanner");
  });

  it("sets __component with category.name format", async () => {
    vi.mocked(readFile).mockResolvedValue(makeComponentSchema() as never);
    const result = await createComponentInterface("./src/components/layout/hero.json");
    expect(result).toContain("__component?: 'layout.hero'");
  });

  it("includes attributes from schema", async () => {
    vi.mocked(readFile).mockResolvedValue(
      makeComponentSchema({ title: { type: "string" }, active: { type: "boolean" } }) as never
    );
    const result = await createComponentInterface("./src/components/header/main.json");
    expect(result).toContain("title?:");
    expect(result).toContain("active?:");
  });

  it("reads file with utf8 encoding", async () => {
    vi.mocked(readFile).mockResolvedValue(makeComponentSchema() as never);
    await createComponentInterface("./src/components/header/main.json");
    expect(readFile).toHaveBeenCalledWith("./src/components/header/main.json", "utf8");
  });
});
