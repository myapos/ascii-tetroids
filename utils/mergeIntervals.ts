import type { Interval } from "utils/types";

/**
 * Merges overlapping or adjacent intervals into a single interval.
 *
 * @param intervals - An array of intervals to be merged. Each interval has a 'from' and 'to' property.
 * @returns A new array of merged intervals, sorted by their starting position.
 *
 * @remarks
 * - The function sorts the intervals by their starting position before merging.
 * - Two intervals are considered mergeable if the start of the next interval is less than or equal to
 *   the end of the current interval plus one (allowing adjacent intervals to be merged).
 * - If the input array is empty, the function will throw an error when trying to access intervals[0].
 *
 * @example
 * ```typescript
 * const intervals = [
 *   { from: 1, to: 3 },
 *   { from: 2, to: 6 },
 *   { from: 8, to: 10 }
 * ];
 * const merged = mergeIntervals(intervals);
 * // Result: [{ from: 1, to: 6 }, { from: 8, to: 10 }]
 * ```
 */
const mergeIntervals = (intervals: Interval[]): Interval[] => {
  intervals.sort((a, b) => a.from - b.from);

  const merged: Interval[] = [];
  let current = intervals[0];

  for (let i = 1; i < intervals.length; i++) {
    const next = intervals[i];

    if (next.from <= current.to + 1) {
      current.to = Math.max(current.to, next.to);
    } else {
      merged.push(current);
      current = next;
    }
  }

  merged.push(current);
  return merged;
};

export default mergeIntervals;
