import { describe, it, expect, beforeEach, vi } from "vitest";

describe("getConfig", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns defaults when no CLI args and no config file", async () => {
    vi.doMock("../../src/utils/get-cli-argument", () => ({
      getCLIArgument: vi.fn().mockReturnValue(undefined),
    }));
    vi.doMock("../../src/file-system/get-file-if-exists", () => ({
      getFileIfExists: vi.fn().mockResolvedValue(undefined),
    }));

    const { getConfig } = await import("../../src/utils/get-config");
    const config = await getConfig();

    expect(config.outputDir).toBe("./@types");
    expect(config.strapiDir).toBe(".");
    expect(config.dateType).toBe("string");
    expect(config.usersEnabled).toBe(false);
    expect(config.customFields).toEqual({});
  });

  it("CLI args override defaults", async () => {
    vi.doMock("../../src/utils/get-cli-argument", () => ({
      getCLIArgument: vi.fn((arg: string) => {
        const map: Record<string, string> = {
          outputDir: "./custom-types",
          strapiDir: "./backend",
          dateType: "Date",
        };
        return map[arg];
      }),
    }));
    vi.doMock("../../src/file-system/get-file-if-exists", () => ({
      getFileIfExists: vi.fn().mockResolvedValue(undefined),
    }));

    const { getConfig } = await import("../../src/utils/get-config");
    const config = await getConfig();

    expect(config.outputDir).toBe("./custom-types");
    expect(config.strapiDir).toBe("./backend");
    expect(config.dateType).toBe("Date");
  });

  it("reads config from JSON file", async () => {
    vi.doMock("../../src/utils/get-cli-argument", () => ({
      getCLIArgument: vi.fn().mockReturnValue(undefined),
    }));
    vi.doMock("../../src/file-system/get-file-if-exists", () => ({
      getFileIfExists: vi.fn().mockResolvedValue(
        JSON.stringify({ outputDir: "./from-file", dateType: "Date" })
      ),
    }));

    const { getConfig } = await import("../../src/utils/get-config");
    const config = await getConfig();

    expect(config.outputDir).toBe("./from-file");
    expect(config.dateType).toBe("Date");
  });

  it("sets usersEnabled when package.json contains plugin-users-permissions", async () => {
    vi.doMock("../../src/utils/get-cli-argument", () => ({
      getCLIArgument: vi.fn().mockReturnValue(undefined),
    }));
    vi.doMock("../../src/file-system/get-file-if-exists", () => ({
      getFileIfExists: vi.fn().mockImplementation((path: string) => {
        if (path.includes("package.json")) {
          return Promise.resolve('{"dependencies": {"plugin-users-permissions": "1.0.0"}}');
        }
        return Promise.resolve(undefined);
      }),
    }));

    const { getConfig } = await import("../../src/utils/get-config");
    const config = await getConfig();

    expect(config.usersEnabled).toBe(true);
  });

  it("caches result on second call", async () => {
    const mockGetFileIfExists = vi.fn().mockResolvedValue(undefined);
    vi.doMock("../../src/utils/get-cli-argument", () => ({
      getCLIArgument: vi.fn().mockReturnValue(undefined),
    }));
    vi.doMock("../../src/file-system/get-file-if-exists", () => ({
      getFileIfExists: mockGetFileIfExists,
    }));

    const { getConfig } = await import("../../src/utils/get-config");
    await getConfig();
    await getConfig();

    expect(mockGetFileIfExists).toHaveBeenCalledTimes(2);
  });

  it("derives strapiApiDir and strapiComponentsDir from strapiDir", async () => {
    vi.doMock("../../src/utils/get-cli-argument", () => ({
      getCLIArgument: vi.fn((arg: string) =>
        arg === "strapiDir" ? "./backend" : undefined
      ),
    }));
    vi.doMock("../../src/file-system/get-file-if-exists", () => ({
      getFileIfExists: vi.fn().mockResolvedValue(undefined),
    }));

    const { getConfig } = await import("../../src/utils/get-config");
    const config = await getConfig();

    expect(config.strapiApiDir).toBe("./backend/src/api");
    expect(config.strapiComponentsDir).toBe("./backend/src/components");
  });
});
