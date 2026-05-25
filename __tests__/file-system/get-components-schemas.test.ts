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
vi.mock("../../src/file-system/get-files", () => ({
  getFiles: vi.fn(),
}));

import { getSubdirectories } from "../../src/file-system/get-subdirectories";
import { getFiles } from "../../src/file-system/get-files";
import { getComponentsSchemas } from "../../src/file-system/get-components.schemas";

describe("getComponentsSchemas", () => {
  it("returns sorted component schema paths", async () => {
    vi.mocked(getSubdirectories).mockResolvedValue([
      "./backend/src/components/header",
      "./backend/src/components/footer",
    ]);
    vi.mocked(getFiles).mockImplementation((dir) => {
      if (dir.includes("header")) {
        return Promise.resolve(["./backend/src/components/header/main.json"]);
      }
      return Promise.resolve(["./backend/src/components/footer/links.json"]);
    });

    const schemas = await getComponentsSchemas();

    expect(schemas).toEqual([
      "./backend/src/components/footer/links.json",
      "./backend/src/components/header/main.json",
    ]);
  });

  it("returns empty array when no components", async () => {
    vi.mocked(getSubdirectories).mockResolvedValue([]);
    expect(await getComponentsSchemas()).toEqual([]);
  });

  it("flattens schemas from multiple categories", async () => {
    vi.mocked(getSubdirectories).mockResolvedValue([
      "./components/shared",
      "./components/blog",
    ]);
    vi.mocked(getFiles).mockImplementation((dir) => {
      if (dir.includes("shared")) {
        return Promise.resolve(["./components/shared/a.json", "./components/shared/b.json"]);
      }
      return Promise.resolve(["./components/blog/c.json"]);
    });

    const schemas = await getComponentsSchemas();
    expect(schemas).toHaveLength(3);
  });
});
