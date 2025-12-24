import type { Pos } from "./types";
/**
 * Determines if a point is inside a polygon using the ray casting algorithm.
 *
 * The algorithm works by casting a horizontal ray from the point to infinity
 * and counting how many times it intersects with the polygon's edges. If the
 * count is odd, the point is inside; if even, it's outside.
 *
 * @param p - The point to test, with x and y coordinates
 * @param poly - An array of points defining the polygon vertices in order
 * @returns `true` if the point is inside the polygon, `false` otherwise
 *
 * @example
 * ```typescript
 * const point = { x: 5, y: 5 };
 * const polygon = [
 *   { x: 0, y: 0 },
 *   { x: 10, y: 0 },
 *   { x: 10, y: 10 },
 *   { x: 0, y: 10 }
 * ];
 * const isInside = pointInPolygonRayCasting(point, polygon); // true
 * ```
 * math link with explanation and source:https://www.youtube.com/watch?v=RSXM9bgqxJM
 */
function pointInPolygonRayCasting(p: Pos, poly: Pos[]): boolean {
  let cnt = 0;

  for (let i = 0; i < poly.length; i++) {
    const edge = {
      pointA: poly[i],
      pointB: poly[(i + 1) % poly.length],
    };

    const { x: xp, y: yp } = p;

    const { x: x1, y: y1 } = edge.pointA;
    const { x: x2, y: y2 } = edge.pointB;
    const isIntersectingHorizontally = yp < y1 !== yp < y2;
    const isIntersectingVertically =
      xp < x1 + ((yp - y1) / (y2 - y1)) * (x2 - x1);

    if (isIntersectingHorizontally && isIntersectingVertically) {
      cnt++;
    }
  }

  return cnt % 2 === 1;
}

export default pointInPolygonRayCasting;
