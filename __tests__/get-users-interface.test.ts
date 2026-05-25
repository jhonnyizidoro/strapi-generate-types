import { describe, it, expect, vi } from "vitest";

vi.mock("../src/utils/get-config", () => ({
  getConfig: vi.fn().mockResolvedValue({
    outputDir: "./@types",
    dateType: "string",
    strapiDir: "./backend",
    strapiApiDir: "./backend/src/api",
    strapiComponentsDir: "./backend/src/components",
    usersEnabled: true,
    customFields: {},
  }),
}));
vi.mock("../src/get-custom-fields", () => ({
  getCustomFields: vi.fn().mockReturnValue({}),
}));
vi.mock("../src/file-system/exists", () => ({
  exists: vi.fn(),
}));
vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

import { exists } from "../src/file-system/exists";
import { readFile } from "node:fs/promises";
import { getUsersInterface } from "../src/get-users-interface";

describe("getUsersInterface", () => {
  it("returns undefined when user schema does not exist", async () => {
    vi.mocked(exists).mockResolvedValue(false);
    expect(await getUsersInterface()).toBeUndefined();
  });

  it("returns interface string when user schema exists", async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({
        kind: "collectionType",
        collectionName: "up_users",
        info: { singularName: "user", pluralName: "users", displayName: "User" },
        options: {},
        pluginOptions: {},
        attributes: {
          username: { type: "string" },
          email: { type: "email" },
        },
      }) as never
    );

    const result = await getUsersInterface();
    expect(result).toBeDefined();
    expect(result).toContain("interface User");
    expect(result).toContain("username?:");
    expect(result).toContain("email?:");
  });

  it("checks the correct schema path", async () => {
    vi.mocked(exists).mockResolvedValue(false);
    await getUsersInterface();
    expect(exists).toHaveBeenCalledWith(
      "./backend/src/extensions/users-permissions/content-types/user/schema.json"
    );
  });
});
