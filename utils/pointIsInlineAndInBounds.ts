import vectLengthSquared from "./vectLengthSquared";
import vectDot from "./vectDot";
import type { Pos, Vector } from "./types";
import subtractVect from "./subtractVect";
import vectCross from "./vectCross";

const COLLINEAR_TOLERANCE = 1e-9;

/**
 * Determines whether a point lies on the line segment defined by two endpoints and within its bounds.
 *
 * This function checks if point `p` is collinear with the line segment from `a` to `b`,
 * and if so, whether it falls within the bounds of that segment (inclusive of endpoints).
 *
 * @param p - The point to test
 * @param a - The first endpoint of the line segment
 * @param b - The second endpoint of the line segment
 * @returns `true` if the point is collinear with the line segment and lies between (or on) points `a` and `b`, `false` otherwise
 *
 * @example
 * ```typescript
 * const a = { x: 0, y: 0 };
 * const b = { x: 10, y: 10 };
 * const p = { x: 5, y: 5 };
 * pointIsInlineAndInBounds(p, a, b); // returns true
 *
 * const q = { x: 15, y: 15 };
 * pointIsInlineAndInBounds(q, a, b); // returns false (outside bounds)
 * ```
 */
function pointIsInlineAndInBounds(p: Pos, a: Pos, b: Pos): boolean {
  const AP = subtractVect(p, a);
  const AB = subtractVect(b, a);

  if (Math.abs(vectCross(AP, AB)) > COLLINEAR_TOLERANCE) return false;

  const dotProd = vectDot(AP, AB);
  const ABlenSq = vectLengthSquared(AB);
  const isBeforeA = dotProd < -COLLINEAR_TOLERANCE;
  const isAfterB = dotProd > ABlenSq + COLLINEAR_TOLERANCE;
  if (isBeforeA || isAfterB) return false;

  return true;
}

export default pointIsInlineAndInBounds;
