import { describe, it, expect } from "vitest";
import { isNullable } from "../../src/utils/is-nullable";
import type { Attribute } from "../../src/types";

describe("isNullable", () => {
  it("returns true when required field is absent", () => {
    const attr = { type: "string" } as Attribute;
    expect(isNullable(attr)).toBe(true);
  });

  it("returns true when required is true", () => {
    const attr = { type: "string", required: true } as Attribute;
    expect(isNullable(attr)).toBe(true);
  });

  it("returns false when required is false", () => {
    const attr = { type: "string", required: false } as Attribute;
    expect(isNullable(attr)).toBe(false);
  });

  it("returns true for relation (no required field in type)", () => {
    const attr = {
      type: "relation",
      target: "api::article.article",
      relation: "oneToOne",
    } as Attribute;
    expect(isNullable(attr)).toBe(true);
  });

  it("returns true for media without required", () => {
    const attr = {
      type: "media",
      multiple: false,
      allowedTypes: ["images"],
    } as Attribute;
    expect(isNullable(attr)).toBe(true);
  });

  it("returns false for media with required: false", () => {
    const attr = {
      type: "media",
      multiple: false,
      allowedTypes: ["images"],
      required: false,
    } as Attribute;
    expect(isNullable(attr)).toBe(false);
  });
});
