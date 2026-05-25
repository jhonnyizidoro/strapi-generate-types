import { describe, it, expect, vi } from "vitest";

vi.mock("child_process", () => ({
  execSync: vi.fn(),
}));

import { execSync } from "child_process";
import { prettify } from "../../src/utils/prettify";

describe("prettify", () => {
  it("calls execSync with prettier command", () => {
    prettify("./output", ["Api.d.ts"]);
    expect(execSync).toHaveBeenCalledWith(
      'prettier --write "./output/Api.d.ts"',
      { stdio: "inherit" }
    );
  });

  it("formats multiple files", () => {
    prettify("./types", ["Api.d.ts", "Components.d.ts", "Routes.ts"]);
    expect(execSync).toHaveBeenCalledWith(
      'prettier --write "./types/Api.d.ts" "./types/Components.d.ts" "./types/Routes.ts"',
      { stdio: "inherit" }
    );
  });

  it("handles paths with spaces", () => {
    prettify("./my types", ["Api.d.ts"]);
    expect(execSync).toHaveBeenCalledWith(
      'prettier --write "./my types/Api.d.ts"',
      { stdio: "inherit" }
    );
  });
});
