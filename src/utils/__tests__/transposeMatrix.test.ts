import { describe, it, expect } from "vitest";
import transposeMatrix, { transposeMatrixInPlace } from "../transposeMatrix";

describe("transposeMatrix", () => {
  it("should transpose a 3x2 matrix", () => {
    const matrix = [
      [1, 2],
      [3, 4],
      [5, 6],
    ];
    const result = transposeMatrix(matrix);
    expect(result).toEqual([
      [1, 3, 5],
      [2, 4, 6],
    ]);
  });

  it("should transpose a 2x3 matrix", () => {
    const matrix = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    const result = transposeMatrix(matrix);
    expect(result).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ]);
  });

  it("should transpose a square matrix", () => {
    const matrix = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const result = transposeMatrix(matrix);
    expect(result).toEqual([
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
    ]);
  });
});

describe("transposeMatrixInPlace", () => {
  it("should transpose a square matrix in place", () => {
    const matrix = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    transposeMatrixInPlace(matrix);
    expect(matrix).toEqual([
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
    ]);
  });

  it("should handle 2x2 matrix in place", () => {
    const matrix = [
      [1, 2],
      [3, 4],
    ];
    transposeMatrixInPlace(matrix);
    expect(matrix).toEqual([
      [1, 3],
      [2, 4],
    ]);
  });
});
