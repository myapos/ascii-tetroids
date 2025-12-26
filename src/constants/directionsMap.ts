import type { Direction } from "utils/types.ts";
export type DirectionData = {
  rowShift: number;
  colShift: number;
};
const directionsMap: Record<Direction, DirectionData> = {
  "^": {
    rowShift: -1,
    colShift: 0,
  },
  ">": {
    rowShift: 0,
    colShift: 1,
  },
  "v": {
    rowShift: 1,
    colShift: 0,
  },
  "<": {
    rowShift: 0,
    colShift: -1,
  },
};

export default directionsMap;
