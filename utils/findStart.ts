import type { Pos } from "./types.ts";
const START = "S";

const findStart = (grid: string[][], start: string = START): Pos | null => {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === start) {
        return { x, y };
      }
    }
  }
  return null;
};

export default findStart;
