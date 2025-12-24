/**
 * Calculates the cross product of two 2D vectors.
 *
 * The cross product in 2D returns a scalar value representing the z-component of the 3D cross product
 * (assuming z=0 for both vectors). This value indicates the orientation and area:
 * - Positive: v2 is counterclockwise from v1
 * - Negative: v2 is clockwise from v1
 * - Zero: vectors are collinear (parallel or antiparallel)
 *
 * @param v1 - The first vector
 * @param v2 - The second vector
 * @returns The cross product (v1.x * v2.y - v1.y * v2.x)
 *
 * @example
 * ```typescript
 * const v1 = { x: 1, y: 0 };
 * const v2 = { x: 0, y: 1 };
 * cross(v1, v2); // returns 1 (counterclockwise)
 *
 * const v3 = { x: 2, y: 4 };
 * const v4 = { x: 1, y: 2 };
 * cross(v3, v4); // returns 0 (collinear)
 * ```
 */
const vectCross = (v1: Vector, v2: Vector): number => v1.x * v2.y - v1.y * v2.x;

export default vectCross;
