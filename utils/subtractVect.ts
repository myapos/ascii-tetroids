/**
 * Subtracts vector b from vector a, returning the resulting vector.
 *
 * Performs component-wise subtraction: (a.x - b.x, a.y - b.y).
 * This operation can be used to find the vector from point b to point a.
 *
 * @param a - The vector to subtract from (minuend)
 * @param b - The vector to subtract (subtrahend)
 * @returns A new vector representing the difference (a - b)
 *
 * @example
 * ```typescript
 * const a = { x: 5, y: 8 };
 * const b = { x: 2, y: 3 };
 * subtract(a, b); // returns { x: 3, y: 5 }
 * ```
 */

const subtractVect = (a: Pos, b: Pos): Vector => ({
  x: a.x - b.x,
  y: a.y - b.y,
});

export default subtractVect;
