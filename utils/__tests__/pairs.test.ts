import { describe, it, expect, mock } from "bun:test";
import createGridPairs from "../pairs";

describe("createGridPairs", () => {
  it("should return an empty array for an empty grid", () => {
    const grid: number[][] = [];
    const result = createGridPairs(grid);
    expect(result).toEqual([]);
  });

  it("should return pairs for a 1x1 grid", () => {
    const grid = [[1]];
    const result = createGridPairs(grid);
    expect(result).toEqual([]);
  });

  it("should return pairs for a 2x2 grid", () => {
    const grid = [
      [1, 2],
      [3, 4],
    ];
    const result = createGridPairs(grid);
    expect(result).toEqual([
      [1, 2],
      [1, 3],
      [1, 4],
      [2, 3],
      [2, 4],
      [3, 4],
    ]);
  });

  it("should return pairs for a 3x3 grid", () => {
    const grid = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const result = createGridPairs(grid);
    expect(result).toEqual([
      [1, 2],
      [1, 3],
      [1, 4],
      [1, 5],
      [1, 6],
      [1, 7],
      [1, 8],
      [1, 9],
      [2, 3],
      [2, 4],
      [2, 5],
      [2, 6],
      [2, 7],
      [2, 8],
      [2, 9],
      [3, 4],
      [3, 5],
      [3, 6],
      [3, 7],
      [3, 8],
      [3, 9],
      [4, 5],
      [4, 6],
      [4, 7],
      [4, 8],
      [4, 9],
      [5, 6],
      [5, 7],
      [5, 8],
      [5, 9],
      [6, 7],
      [6, 8],
      [6, 9],
      [7, 8],
      [7, 9],
      [8, 9],
    ]);
  });

  it("should call the callback for each pair", () => {
    const grid = [
      [1, 2],
      [3, 4],
    ];
    const callback = mock();
    createGridPairs(grid, callback);
    expect(callback).toHaveBeenCalledTimes(6);
    expect(callback).toHaveBeenCalledWith([1, 2]);
    expect(callback).toHaveBeenCalledWith([1, 3]);
    expect(callback).toHaveBeenCalledWith([1, 4]);
    expect(callback).toHaveBeenCalledWith([2, 3]);
    expect(callback).toHaveBeenCalledWith([2, 4]);
    expect(callback).toHaveBeenCalledWith([3, 4]);
  });
});
