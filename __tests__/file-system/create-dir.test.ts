import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/file-system/exists", () => ({
  exists: vi.fn(),
}));
vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn(),
}));

import { exists } from "../../src/file-system/exists";
import { mkdir } from "node:fs/promises";
import { createDir } from "../../src/file-system/create-dir";

describe("createDir", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips mkdir when directory already exists", async () => {
    vi.mocked(exists).mockResolvedValue(true);
    await createDir("./output");
    expect(mkdir).not.toHaveBeenCalled();
  });

  it("creates directory with recursive flag when it does not exist", async () => {
    vi.mocked(exists).mockResolvedValue(false);
    vi.mocked(mkdir).mockResolvedValue(undefined);
    await createDir("./output");
    expect(mkdir).toHaveBeenCalledWith("./output", { recursive: true });
  });
});
