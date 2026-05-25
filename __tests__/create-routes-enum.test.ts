import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/utils/get-config", () => ({
  getConfig: vi.fn().mockResolvedValue({
    outputDir: "./@types",
    dateType: "string",
    strapiDir: ".",
    strapiApiDir: "./src/api",
    strapiComponentsDir: "./src/components",
    usersEnabled: false,
    customFields: {},
  }),
}));
vi.mock("../src/file-system/get-api-schemas", () => ({
  getApiSchemas: vi.fn(),
}));
vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

import { getApiSchemas } from "../src/file-system/get-api-schemas";
import { readFile, writeFile } from "node:fs/promises";
import { createRoutesEnum } from "../src/create-routes-enum";

describe("createRoutesEnum", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(writeFile).mockResolvedValue(undefined);
  });

  it("generates collection type with both route and document route", async () => {
    vi.mocked(getApiSchemas).mockResolvedValue(["./src/api/article/content-types/article/schema.json"]);
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({
        kind: "collectionType",
        info: { singularName: "article", pluralName: "articles" },
        attributes: {},
      }) as never
    );

    await createRoutesEnum();
    const written = vi.mocked(writeFile).mock.calls[0]?.[1] as string;

    expect(written).toContain("Article = 'articles'");
    expect(written).toContain("ArticleDocument = 'articles/{documentId}'");
  });

  it("generates single type with only one route", async () => {
    vi.mocked(getApiSchemas).mockResolvedValue(["./src/api/homepage/content-types/homepage/schema.json"]);
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({
        kind: "singleType",
        info: { singularName: "homepage", pluralName: "homepages" },
        attributes: {},
      }) as never
    );

    await createRoutesEnum();
    const written = vi.mocked(writeFile).mock.calls[0]?.[1] as string;

    expect(written).toContain("Homepage = 'homepage'");
    expect(written).not.toContain("HomepageDocument");
  });

  it("writes to Routes.ts in outputDir", async () => {
    vi.mocked(getApiSchemas).mockResolvedValue([]);
    await createRoutesEnum();
    expect(writeFile).toHaveBeenCalledWith("./@types/Routes.ts", expect.any(String));
  });

  it("wraps in StrapiRoute enum", async () => {
    vi.mocked(getApiSchemas).mockResolvedValue([]);
    await createRoutesEnum();
    const written = vi.mocked(writeFile).mock.calls[0]?.[1] as string;
    expect(written).toContain("export enum StrapiRoute");
  });
});

describe("createRoutesEnum with usersEnabled", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("adds Users routes when usersEnabled", async () => {
    vi.doMock("../src/utils/get-config", () => ({
      getConfig: vi.fn().mockResolvedValue({
        outputDir: "./@types",
        dateType: "string",
        strapiDir: ".",
        strapiApiDir: "./src/api",
        strapiComponentsDir: "./src/components",
        usersEnabled: true,
        customFields: {},
      }),
    }));
    vi.doMock("../src/file-system/get-api-schemas", () => ({
      getApiSchemas: vi.fn().mockResolvedValue([]),
    }));
    const mockWriteFile = vi.fn().mockResolvedValue(undefined);
    vi.doMock("node:fs/promises", () => ({
      readFile: vi.fn(),
      writeFile: mockWriteFile,
    }));

    const { createRoutesEnum: createRoutesEnumFresh } = await import(
      "../src/create-routes-enum"
    );
    await createRoutesEnumFresh();

    const written = mockWriteFile.mock.calls[0]?.[1] as string;
    expect(written).toContain("Users = 'users'");
    expect(written).toContain("UsersDocument = 'users/{documentId}'");
  });
});
