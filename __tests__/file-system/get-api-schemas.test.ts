import { describe, it, expect, vi } from "vitest";

vi.mock("../../src/utils/get-config", () => ({
  getConfig: vi.fn().mockResolvedValue({
    strapiApiDir: "./backend/src/api",
    strapiComponentsDir: "./backend/src/components",
    outputDir: "./@types",
    dateType: "string",
    usersEnabled: false,
    customFields: {},
  }),
}));
vi.mock("../../src/file-system/get-subdirectories", () => ({
  getSubdirectories: vi.fn(),
}));

import { getSubdirectories } from "../../src/file-system/get-subdirectories";
import { getApiSchemas } from "../../src/file-system/get-api-schemas";

describe("getApiSchemas", () => {
  it("returns sorted schema paths from api folders", async () => {
    vi.mocked(getSubdirectories).mockResolvedValue([
      "./backend/src/api/tag",
      "./backend/src/api/article",
    ]);

    const schemas = await getApiSchemas();

    expect(schemas).toEqual([
      "./backend/src/api/article/content-types/article/schema.json",
      "./backend/src/api/tag/content-types/tag/schema.json",
    ]);
  });

  it("returns empty array when no api folders", async () => {
    vi.mocked(getSubdirectories).mockResolvedValue([]);
    expect(await getApiSchemas()).toEqual([]);
  });

  it("builds correct path from folder name", async () => {
    vi.mocked(getSubdirectories).mockResolvedValue([
      "./backend/src/api/my-collection",
    ]);

    const schemas = await getApiSchemas();
    expect(schemas[0]).toBe(
      "./backend/src/api/my-collection/content-types/my-collection/schema.json"
    );
  });
});
