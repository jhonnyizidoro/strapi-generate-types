import { describe, it, expect } from "vitest";
import { parseJSON } from "../../src/utils/parse-json";

describe("parseJSON", () => {
  it("parses valid JSON object", () => {
    expect(parseJSON('{"key": "value"}')).toEqual({ key: "value" });
  });

  it("parses nested objects", () => {
    expect(parseJSON('{"a": {"b": 1}}')).toEqual({ a: { b: 1 } });
  });

  it("returns undefined for invalid JSON", () => {
    expect(parseJSON("not-json")).toBeUndefined();
  });

  it("returns empty object for JSON number (not typeof object)", () => {
    expect(parseJSON("42")).toEqual({});
  });

  it("returns empty object for JSON string (not typeof object)", () => {
    expect(parseJSON('"hello"')).toEqual({});
  });

  it("returns undefined for empty string (invalid JSON)", () => {
    expect(parseJSON("")).toBeUndefined();
  });

  it("returns undefined when called with no args", () => {
    expect(parseJSON()).toBeUndefined();
  });

  it("parses JSON array (typeof array is object)", () => {
    expect(parseJSON("[1,2,3]")).toEqual([1, 2, 3]);
  });
});
