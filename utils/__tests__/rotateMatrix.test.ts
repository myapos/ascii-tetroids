import { describe, it, expect } from "vitest";

import rotateMatrix from "../rotateMatrix";
import type { Shape } from "src/types";

const LIVE = "@";

const L: Shape = [
  [".", ".", ".", ".", LIVE, ".", "."],
  [".", ".", ".", ".", LIVE, ".", "."],
  [".", ".", LIVE, LIVE, LIVE, ".", "."],
];

describe("rotateMatrix", () => {
  it("rotates a 2x2 matrix clockwise", () => {
    const matrix = [
      [1, 2],
      [3, 4],
    ];
    const result = rotateMatrix(matrix);
    expect(result).toEqual([
      [3, 1],
      [4, 2],
    ]);
  });

  it("rotates a 3x3 matrix clockwise", () => {
    const matrix = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const result = rotateMatrix(matrix);
    expect(result).toEqual([
      [7, 4, 1],
      [8, 5, 2],
      [9, 6, 3],
    ]);
  });

  it("rotates a 2x3 matrix (non-square)", () => {
    const matrix = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    const result = rotateMatrix(matrix);
    expect(result).toEqual([
      [4, 1],
      [5, 2],
      [6, 3],
    ]);
  });

  it("rotates a single element matrix", () => {
    const matrix = [[1]];
    const result = rotateMatrix(matrix);
    expect(result).toEqual([[1]]);
  });

  it("rotates a single row matrix", () => {
    const matrix = [[1, 2, 3]];
    const result = rotateMatrix(matrix);
    expect(result).toEqual([[1], [2], [3]]);
  });

  it("rotates a matrix with string elements", () => {
    const matrix = [
      ["a", "b"],
      ["c", "d"],
    ];
    const result = rotateMatrix(matrix);
    expect(result).toEqual([
      ["c", "a"],
      ["d", "b"],
    ]);
  });

  it("rotates an L-shaped tetromino", () => {
    const result = rotateMatrix(L);
    expect(result).toEqual([
      [".", ".", "."],
      [".", ".", "."],
      [LIVE, ".", "."],
      [LIVE, ".", "."],
      [LIVE, LIVE, LIVE],
      [".", ".", "."],
      [".", ".", "."],
    ]);
  });

  it("rotates L-shape 90 degrees four times returns to original", () => {
    let rotated = L;
    for (let i = 0; i < 4; i++) {
      rotated = rotateMatrix(rotated);
    }
    expect(rotated).toEqual(L);
  });

  it("rotates L-shape 180 degrees", () => {
    const rotated180 = rotateMatrix(rotateMatrix(L));
    expect(rotated180).toEqual([
      [".", ".", LIVE, LIVE, LIVE, ".", "."],
      [".", ".", LIVE, ".", ".", ".", "."],
      [".", ".", LIVE, ".", ".", ".", "."],
    ]);
  });
});
