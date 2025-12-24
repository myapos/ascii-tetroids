import isInBounds from "utils/isInBounds";
import type { Pos } from "./types.ts";

/**
 * Safely pushes a position to a list if it's within the bounds of the grid.
 * Only adds the position if it's within the valid bounds of the provided grid.
 *
 * @param list - The array of positions to push to
 * @param pos - The position to add to the list
 * @param grid - The 2D grid used to validate bounds
 * @returns void
 */
const safePushToQueue = (
  list: Pos[],
  pos: Pos,
  grid: string[][]
): unknown[] => {
  // only add if isInBounds
  if (isInBounds(pos, grid)) {
    list.push(pos);
  }

  return list;
};

export default safePushToQueue;
