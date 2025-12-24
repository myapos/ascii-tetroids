import type { Interval } from "utils/types";
const countPoints = (intervals: Interval[]): number =>
  intervals.reduce((sum, i) => sum + (i.to - i.from + 1), 0);

export default countPoints;
