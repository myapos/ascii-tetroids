import { describe, it, expect } from "bun:test";
import sum from "utils/sumAr";

describe("sum", () => {
  it("should return 0 for empty array", () => {
    const result = sum([]);
    expect(result).toBe(0);
  });

  it('should return 0 for ["0"]', () => {
    const result = sum([0]);
    expect(result).toBe(0);
  });

  it('should return 1 for ["1"]', () => {
    const result = sum([1]);
    expect(result).toBe(1);
  });

  it('should return 1 for ["1", "0"]', () => {
    const result = sum([1, 0]);
    expect(result).toBe(1);
  });

  it('should return 1 for ["0", "1"]', () => {
    const result = sum([0, 1]);
    expect(result).toBe(1);
  });

  it('should return 2 for ["1", "1"]', () => {
    const result = sum([1, 1]);
    expect(result).toBe(2);
  });

  it("should return the correct sum for an array of 10 values", () => {
    const result = sum([1, -1, 2, -2, 3, -3, 4, -4, 5, -5]);
    expect(result).toBe(0);
  });
});
