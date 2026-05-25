import { describe, it, expect } from "vitest";
import { titleCase } from "../../src/utils/title-case";

describe("titleCase", () => {
  it("capitalizes single word", () => {
    expect(titleCase("hello")).toBe("Hello");
  });

  it("joins hyphenated words in title case", () => {
    expect(titleCase("some-name")).toBe("SomeName");
  });

  it("joins underscore-separated words", () => {
    expect(titleCase("my_component")).toBe("MyComponent");
  });

  it("lowercases subsequent chars", () => {
    expect(titleCase("hELLO")).toBe("Hello");
  });

  it("handles multiple words with separators", () => {
    expect(titleCase("main-header-component")).toBe("MainHeaderComponent");
  });

  it("strips numbers (regex matches only letters)", () => {
    expect(titleCase("tag123abc")).toBe("TagAbc");
  });

  it("returns empty string for empty input", () => {
    expect(titleCase("")).toBe("");
  });

  it("returns empty string when called with no args", () => {
    expect(titleCase()).toBe("");
  });

  it("handles already-title-case input", () => {
    expect(titleCase("TagName")).toBe("Tagname");
  });
});
