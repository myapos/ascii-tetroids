import pointIsInlineAndInBounds from "./pointIsInlineAndInBounds";
import type { Pos } from "./types";
/**
 * Determines whether a point lies on the edge of a polygon.
 *
 * @param p - The point to check
 * @param poly - An array of positions defining the polygon's vertices
 * @returns `true` if the point lies on any edge of the polygon, `false` otherwise
 *
 * @remarks
 * This function iterates through each edge of the polygon and checks if the point
 * lies on the line segment between consecutive vertices using `pointIsInlineAndInBounds`.
 * The polygon is treated as closed, with the last vertex connecting back to the first.
 */
function pointOnEdge(p: Pos, poly: Pos[]): boolean {
  for (let i = 0; i < poly.length; i++) {
    const start = poly[i];
    const end = poly[(i + 1) % poly.length];
    if (pointIsInlineAndInBounds(p, start, end)) {
      return true;
    }
  }
  return false;
}

export default pointOnEdge;
