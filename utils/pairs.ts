/**
 * Creates all unique pairs of elements from a 2D grid.
 *
 * @template T - The type of elements in the grid
 * @param {T[][]} grid - A 2D array containing elements to pair
 * @param {(pair: [T, T]) => void} [callback] - Optional callback function invoked for each pair created
 * @returns {[T, T][]} An array containing all unique pairs of elements from the grid
 *
 * @remarks
 * - Generates pairs by comparing each element with every element that comes after it (top-to-bottom, left-to-right)
 * - Returns an empty array if the input grid is empty
 * - The order of pairs follows row-major traversal of the grid
 * - Each pair is created exactly once (no duplicates or reverse pairs)
 *
 * @example
 * ```typescript
 * const grid = [[1, 2], [3, 4]];
 * const pairs = createGridPairs(grid);
 * // Returns: [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]
 * ```
 *
 * @example
 * ```typescript
 * const grid = [['a', 'b'], ['c', 'd']];
 * createGridPairs(grid, (pair) => {
 *   console.log(`Pair: ${pair[0]}, ${pair[1]}`);
 * });
 * ```
 */
function createGridPairs<T>(
  grid: T[][],
  callback?: (pair: [T, T]) => void
): [T, T][] {
  if (grid.length === 0) {
    return [];
  }
  const pairs: [T, T][] = [];
  const rows = grid.length;
  const cols = grid[0].length;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      for (let k = i; k < rows; k++) {
        for (let l = k === i ? j + 1 : 0; l < cols; l++) {
          const pair: [T, T] = [grid[i][j], grid[k][l]];
          pairs.push(pair);
          if (callback) {
            callback(pair);
          }
        }
      }
    }
  }

  return pairs;
}

export default createGridPairs;
