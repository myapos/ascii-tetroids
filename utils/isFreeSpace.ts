import isInBounds from "./isInBounds.ts";
const FREE_SPACE = ".";
import type { Pos } from "./types.ts";

const isFreeSpace = (
  grid: string[][],
  pos: Pos,
  freeSpace: string = FREE_SPACE
): boolean => {
  if (!isInBounds(pos, grid)) {
    return false;
  }
  const cell = grid[pos.y][pos.x];
  return cell === freeSpace;
};

export default isFreeSpace;
