import { describe, it, expect } from "bun:test";

import checkPatterns from "utils/checkPatterns";
import * as patternsConstants from "../../2024/constants/constants";

describe("checkPatterns", () => {
  it("should return true for pattern 1", () => {
    expect(checkPatterns(patternsConstants.pattern1)).toBe(true);
  });
  it("should return true for pattern 2", () => {
    expect(checkPatterns(patternsConstants.pattern2)).toBe(true);
  });
  it("should return true for pattern 3", () => {
    expect(checkPatterns(patternsConstants.pattern3)).toBe(true);
  });
  it("should return true for pattern 4", () => {
    expect(checkPatterns(patternsConstants.pattern4)).toBe(true);
  });

  it("should return true for pattern 5", () => {
    expect(checkPatterns(patternsConstants.pattern5)).toBe(true);
  });

  it("should return false 1", () => {
    expect(
      checkPatterns([
        ["S", "S", "S"],
        ["#", "S", "#"],
        ["M", "#", "M"],
      ])
    ).toBe(false);
  });

  it("should return false 2", () => {
    expect(
      checkPatterns([
        ["S", "S", "S"],
        ["M", "#", "#"],
        ["M", "#", "M"],
      ])
    ).toBe(false);
  });

  it("should return false 3", () => {
    expect(
      checkPatterns([
        ["S", "M", "S"],
        ["M", "M", "#"],
        ["M", "#", "M"],
      ])
    ).toBe(false);
  });
  it("should return false 4", () => {
    expect(
      checkPatterns([
        ["M", "M", "M"],
        ["M", "M", "M"],
        ["M", "M", "M"],
      ])
    ).toBe(false);
  });
});
