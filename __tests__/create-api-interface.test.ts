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
import { createApiInterface } from "../src/create-api-interface";

const makeSchema = (overrides = {}) =>
  JSON.stringify({
    kind: "collectionType",
    collectionName: "articles",
    info: { singularName: "article", pluralName: "articles", displayName: "Article" },
    options: { draftAndPublish: true },
    pluginOptions: {},
    attributes: { title: { type: "string" } },
    ...overrides,
  });

describe("createApiInterface", () => {
  it("generates interface with id and documentId", async () => {
    vi.mocked(readFile).mockResolvedValue(makeSchema() as never);
    const result = await createApiInterface("./src/api/article/content-types/article/schema.json");
    expect(result).toContain("interface Article");
    expect(result).toContain("id?: number");
    expect(result).toContain("documentId?: string");
  });

  it("derives interface name from path (second to last segment)", async () => {
    vi.mocked(readFile).mockResolvedValue(makeSchema() as never);
    const result = await createApiInterface("./src/api/article/content-types/article/schema.json");
    expect(result).toContain("interface Article");
  });

  it("includes attributes from schema", async () => {
    vi.mocked(readFile).mockResolvedValue(
      makeSchema({ attributes: { title: { type: "string" }, count: { type: "integer" } } }) as never
    );
    const result = await createApiInterface("./src/api/article/content-types/article/schema.json");
    expect(result).toContain("title?:");
    expect(result).toContain("count?:");
  });

  it("excludes password fields", async () => {
    vi.mocked(readFile).mockResolvedValue(
      makeSchema({ attributes: { secret: { type: "password" } } }) as never
    );
    const result = await createApiInterface("./src/api/user/content-types/user/schema.json");
    expect(result).not.toContain("secret?:");
  });

  it("adds localization fields when i18n is enabled", async () => {
    vi.mocked(readFile).mockResolvedValue(
      makeSchema({
        pluginOptions: { i18n: { localized: true } },
        attributes: {},
      }) as never
    );
    const result = await createApiInterface("./src/api/article/content-types/article/schema.json");
    expect(result).toContain("locale: string");
    expect(result).toContain("localizations?:");
  });

  it("omits localization fields when i18n is disabled", async () => {
    vi.mocked(readFile).mockResolvedValue(makeSchema({ pluginOptions: {} }) as never);
    const result = await createApiInterface("./src/api/article/content-types/article/schema.json");
    expect(result).not.toContain("locale: string");
  });

  it("reads file with utf-8 encoding", async () => {
    vi.mocked(readFile).mockResolvedValue(makeSchema() as never);
    await createApiInterface("./src/api/article/content-types/article/schema.json");
    expect(readFile).toHaveBeenCalledWith(
      "./src/api/article/content-types/article/schema.json",
      "utf-8"
    );
  });
});
