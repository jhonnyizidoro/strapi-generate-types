import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/file-system/exists", () => ({
  exists: vi.fn(),
}));
vi.mock("node:fs/promises", () => ({
  readdir: vi.fn(),
  stat: vi.fn(),
}));

import { exists } from "../../src/file-system/exists";
import { readdir, stat } from "node:fs/promises";
import { getSubdirectories } from "../../src/file-system/get-subdirectories";

describe("getSubdirectories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when path does not exist", async () => {
    vi.mocked(exists).mockResolvedValue(false);
    expect(await getSubdirectories("/missing")).toEqual([]);
  });

  it("returns subdirectories with full paths", async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readdir).mockResolvedValue(["article", "tag"] as never);
    vi.mocked(stat).mockResolvedValue({ isDirectory: () => true } as never);
    expect(await getSubdirectories("/src/api")).toEqual([
      "/src/api/article",
      "/src/api/tag",
    ]);
  });

  it("excludes files", async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readdir).mockResolvedValue(["article", "schema.json"] as never);
    vi.mocked(stat).mockImplementation((path) => {
      const isDir = !String(path).endsWith(".json");
      return Promise.resolve({ isDirectory: () => isDir }) as never;
    });
    const result = await getSubdirectories("/src/api");
    expect(result).toEqual(["/src/api/article"]);
  });

  it("returns empty array for directory with no subdirectories", async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readdir).mockResolvedValue(["file.json"] as never);
    vi.mocked(stat).mockResolvedValue({ isDirectory: () => false } as never);
    expect(await getSubdirectories("/src/api")).toEqual([]);
  });
});
