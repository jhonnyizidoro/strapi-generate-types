import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getCLIArgument } from "../../src/utils/get-cli-argument";

describe("getCLIArgument", () => {
  const originalArgv = process.argv;

  afterEach(() => {
    process.argv = originalArgv;
  });

  it("returns value for present argument", () => {
    process.argv = ["node", "script.js", "--strapiDir=backend"];
    expect(getCLIArgument("strapiDir")).toBe("backend");
  });

  it("returns value for config argument", () => {
    process.argv = ["node", "script.js", "--config=my-config.json"];
    expect(getCLIArgument("config")).toBe("my-config.json");
  });

  it("returns undefined when argument is absent", () => {
    process.argv = ["node", "script.js"];
    expect(getCLIArgument("strapiDir")).toBeUndefined();
  });

  it("returns value from multiple arguments", () => {
    process.argv = ["node", "script.js", "--outputDir=./types", "--strapiDir=./backend"];
    expect(getCLIArgument("outputDir")).toBe("./types");
    expect(getCLIArgument("strapiDir")).toBe("./backend");
  });

  it("returns empty string for flag without value", () => {
    process.argv = ["node", "script.js", "--outputDir="];
    expect(getCLIArgument("outputDir")).toBe("");
  });
});
