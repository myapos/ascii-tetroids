export const pattern1 = [
  ["M", "#", "M"],
  ["#", "A", "#"],
  ["S", "#", "S"],
];

export const pattern2 = [
  ["S", "#", "M"],
  ["#", "A", "#"],
  ["S", "#", "M"],
];

export const pattern3 = [
  ["M", "#", "M"],
  ["#", "A", "#"],
  ["S", "#", "S"],
];

export const pattern4 = [
  ["S", "#", "S"],
  ["#", "A", "#"],
  ["M", "#", "M"],
];

export const pattern5 = [
  ["M", "#", "S"],
  ["#", "A", "#"],
  ["M", "#", "S"],
];

export const patterns = [pattern1, pattern2, pattern3, pattern4, pattern5];

export const LIVE = "@";
export const REST = "#";
export const FLOOR = "-";
export const EMPTY = ".";
export const PREVIEW = " ";
export const MAX_CHAMBER_HEIGHT = 25;
export const NUM_OF_COLS = 15;
export const SPEED = 250; //ms
export const PREVIEW_COLS = 5;
export const TOTAL_NUM_OF_COLS = NUM_OF_COLS + PREVIEW_COLS;
