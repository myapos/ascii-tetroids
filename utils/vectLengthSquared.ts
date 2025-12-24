import vectDot from "./vectDot";
/**
 * Calculates the squared length (magnitude) of a vector.
 *
 * This is more efficient than calculating the actual length since it avoids the square root operation.
 * Useful for comparisons where the actual length value is not needed.
 *
 * @param v - The vector whose squared length is to be calculated
 * @returns The squared length of the vector (v.x² + v.y²)
 *
 * @example
 * ```typescript
 * const v = { x: 3, y: 4 };
 * lengthSquared(v); // returns 25 (3² + 4² = 9 + 16 = 25)
 * ```
 */
const vectLengthSquared = (v: Vector): number => vectDot(v, v);
export default vectLengthSquared;
