import type { Pos } from "src/types.ts";
/**
 * Checks if a given position is within the bounds of a 2D grid.
 *
 * @param pos - The position to check, containing x and y coordinates
 * @param grid - A 2D array representing the grid boundaries
 * @returns `true` if the position is within the grid bounds, `false` otherwise
 *
 * @example
 * ```ts
 * const grid = [['a', 'b'], ['c', 'd']];
 * const pos = { x: 1, y: 0 };
 * isInBounds(pos, grid); // returns true
 *
 * const outOfBounds = { x: 2, y: 0 };
 * isInBounds(outOfBounds, grid); // returns false
 * ```
 */
const isInBounds = (pos: Pos, grid: string[][]): boolean => {
  return (
    pos.y >= 0 && pos.y < grid.length && pos.x >= 0 && pos.x < grid[0].length
  );
};
export default isInBounds;
