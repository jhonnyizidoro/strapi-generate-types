import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/file-system/exists", () => ({
  exists: vi.fn(),
}));
vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
}));

import { exists } from "../../src/file-system/exists";
import { readFile } from "node:fs/promises";
import { getFileIfExists } from "../../src/file-system/get-file-if-exists";

describe("getFileIfExists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns undefined when file does not exist", async () => {
    vi.mocked(exists).mockResolvedValue(false);
    expect(await getFileIfExists("/missing.json")).toBeUndefined();
    expect(readFile).not.toHaveBeenCalled();
  });

  it("returns file content when file exists", async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readFile).mockResolvedValue('{"key":"value"}' as never);
    expect(await getFileIfExists("/config.json")).toBe('{"key":"value"}');
  });

  it("reads file with utf-8 encoding", async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readFile).mockResolvedValue("content" as never);
    await getFileIfExists("/file.txt");
    expect(readFile).toHaveBeenCalledWith("/file.txt", "utf-8");
  });
});
