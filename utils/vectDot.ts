/**
 * Calculates the dot product of two vectors.
 *
 * The dot product is the sum of the products of corresponding components of two vectors.
 * It can be used to determine the angle between vectors or project one vector onto another.
 *
 * @param v1 - The first vector
 * @param v2 - The second vector
 * @returns The dot product of v1 and v2 (v1.x * v2.x + v1.y * v2.y)
 *
 * @example
 * ```typescript
 * const v1 = { x: 3, y: 4 };
 * const v2 = { x: 2, y: 1 };
 * dot(v1, v2); // returns 10 (3 * 2 + 4 * 1 = 6 + 4 = 10)
 * ```
 */

const vectDot = (v1: Vector, v2: Vector): number => v1.x * v2.x + v1.y * v2.y;

export default vectDot;
