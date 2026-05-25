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
vi.mock("node:fs/promises", () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn(),
}));

import { writeFile } from "node:fs/promises";
import { createNamespace } from "../src/create-namespace";

describe("createNamespace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("wraps content in namespace declaration", async () => {
    await createNamespace(["interface Foo { id?: number }", "interface Bar {}"], "Api");
    const written = vi.mocked(writeFile).mock.calls[0]?.[1] as string;
    expect(written).toContain("declare namespace Api");
    expect(written).toContain("interface Foo");
    expect(written).toContain("interface Bar");
  });

  it("writes to correct file path", async () => {
    await createNamespace([], "Strapi");
    expect(writeFile).toHaveBeenCalledWith("./@types/Strapi.d.ts", expect.any(String));
  });

  it("uses namespace name from argument", async () => {
    await createNamespace([], "Components");
    const writtenPath = vi.mocked(writeFile).mock.calls[0]?.[0] as string;
    expect(writtenPath).toBe("./@types/Components.d.ts");
  });

  it("joins multiple content items", async () => {
    await createNamespace(["interface A {}", "interface B {}"], "Api");
    const written = vi.mocked(writeFile).mock.calls[0]?.[1] as string;
    expect(written).toContain("interface A {}");
    expect(written).toContain("interface B {}");
  });
});
