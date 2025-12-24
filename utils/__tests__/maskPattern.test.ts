import { describe, it, expect } from "bun:test";
import maskPattern from "utils/maskPattern";
describe("maskPattern", () => {
  describe("maskPattern", () => {
    it("should mask pattern 1", () => {
      const input = [
        ["M", "M", "M"],
        ["S", "S", "S"],
        ["M", "M", "M"],
      ];

      const expected = [
        ["M", "#", "M"],
        ["#", "S", "#"],
        ["M", "#", "M"],
      ];

      expect(maskPattern(input)).toEqual(expected);
    });

    it("should mask pattern 2", () => {
      const input = [
        ["#", "#", "#"],
        ["#", "#", "#"],
        ["#", "#", "#"],
      ];

      const expected = [
        ["#", "#", "#"],
        ["#", "#", "#"],
        ["#", "#", "#"],
      ];

      expect(maskPattern(input)).toEqual(expected);
    });

    it("should mask pattern 3", () => {
      const input = [
        ["A", "B", "C"],
        ["D", "E", "F"],
        ["G", "H", "I"],
      ];

      const expected = [
        ["A", "#", "C"],
        ["#", "E", "#"],
        ["G", "#", "I"],
      ];

      expect(maskPattern(input)).toEqual(expected);
    });

    it("should mask pattern 4", () => {
      const input = [
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"],
      ];

      const expected = [
        ["1", "#", "3"],
        ["#", "5", "#"],
        ["7", "#", "9"],
      ];

      expect(maskPattern(input)).toEqual(expected);
    });

    it("should mask pattern 5", () => {
      const input = [
        ["X", "Y", "Z"],
        ["P", "Q", "R"],
        ["L", "M", "N"],
      ];

      const expected = [
        ["X", "#", "Z"],
        ["#", "Q", "#"],
        ["L", "#", "N"],
      ];

      expect(maskPattern(input)).toEqual(expected);
    });
  });
});
