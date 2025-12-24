/**
 * Determines whether two numeric ranges overlap.
 *
 * Each range is represented as a two-element array [start, end]. Endpoints are treated as inclusive.
 * The function returns true if the ranges share any point in common, including when one range
 * fully contains the other or they touch at an endpoint.
 *
 * @param range1 - A two-element array [start, end] for the first range. Expected start <= end.
 * @param range2 - A two-element array [start, end] for the second range. Expected start <= end.
 * @returns True if the ranges overlap or touch at an endpoint; otherwise false.
 *
 * @remarks
 * - The function assumes each input is a numeric 2-tuple. Passing arrays with different lengths
 *   or non-numeric values leads to undefined behavior.
 * - If you require strict overlap (excluding touching at endpoints), modify the comparisons
 *   from inclusive (<=) to strict (<).
 *
 * @example
 * // true — overlapping ranges
 * isRangeOverlap([2, 5], [4, 8]);
 *
 * @example
 * // true — touching at endpoint
 * isRangeOverlap([1, 3], [3, 6]);
 *
 * @example
 * // false — disjoint ranges
 * isRangeOverlap([1, 2], [3, 4]);
 *
 * Case illustrations:
 * |-----|         ,   |-------| ,  |----------| ,      |---|
 *   |------|    ,  |-----|     ,      |---|     ,,   |-------|
 */
const isRangeOverlap = (range1: number[], range2: number[]): boolean => {
  const [s1, e1] = range1;
  const [s2, e2] = range2;
  const case1 = s1 <= s2 && s2 <= e1;
  const case2 = s1 <= e2 && e2 <= e1;
  const case3 = s1 <= s2 && e1 >= e2;
  const case4 = s1 >= s2 && e1 <= e2;

  return case1 || case2 || case3 || case4;
};
export default isRangeOverlap;
