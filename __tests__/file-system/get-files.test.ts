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
import { getFiles } from "../../src/file-system/get-files";

describe("getFiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when path does not exist", async () => {
    vi.mocked(exists).mockResolvedValue(false);
    expect(await getFiles("/missing")).toEqual([]);
  });

  it("returns files with full paths", async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readdir).mockResolvedValue(["file.json", "other.json"] as never);
    vi.mocked(stat).mockResolvedValue({ isDirectory: () => false } as never);
    expect(await getFiles("/components/header")).toEqual([
      "/components/header/file.json",
      "/components/header/other.json",
    ]);
  });

  it("excludes directories", async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readdir).mockResolvedValue(["file.json", "subdir"] as never);
    vi.mocked(stat).mockImplementation((path) => {
      const isDir = String(path).endsWith("subdir");
      return Promise.resolve({ isDirectory: () => isDir }) as never;
    });
    const result = await getFiles("/path");
    expect(result).toEqual(["/path/file.json"]);
    expect(result).not.toContain("/path/subdir");
  });

  it("returns empty array for empty directory", async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readdir).mockResolvedValue([] as never);
    expect(await getFiles("/empty")).toEqual([]);
  });
});
