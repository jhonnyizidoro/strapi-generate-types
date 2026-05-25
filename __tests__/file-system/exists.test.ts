import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:fs/promises", () => ({
  access: vi.fn(),
}));

import { access } from "node:fs/promises";
import { exists } from "../../src/file-system/exists";

describe("exists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when access succeeds", async () => {
    vi.mocked(access).mockResolvedValue(undefined);
    expect(await exists("/some/path")).toBe(true);
  });

  it("returns false when access throws", async () => {
    vi.mocked(access).mockRejectedValue(new Error("ENOENT"));
    expect(await exists("/missing/path")).toBe(false);
  });

  it("calls process.exit when dieOnError and file missing", async () => {
    vi.mocked(access).mockRejectedValue(new Error("ENOENT"));
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    await expect(exists("/missing", { dieOnError: true })).rejects.toThrow(
      "process.exit called"
    );
    expect(exitSpy).toHaveBeenCalled();
    exitSpy.mockRestore();
  });

  it("does not call process.exit when dieOnError is false", async () => {
    vi.mocked(access).mockRejectedValue(new Error("ENOENT"));
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("should not exit");
    });

    expect(await exists("/missing", { dieOnError: false })).toBe(false);
    expect(exitSpy).not.toHaveBeenCalled();
    exitSpy.mockRestore();
  });
});
