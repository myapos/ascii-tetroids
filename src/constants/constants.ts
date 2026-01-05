export const LIVE = "O";
export const REST = "#";
export const FLOOR = "=";
export const SIDE_WALL = "|";
export const EMPTY = ".";
export const PREVIEW = " ";

export const MAX_CHAMBER_HEIGHT = 25;
export const NUM_OF_COLS = 17;
export const PREVIEW_COLS = 10;

export const GRAVITY_SPEED = 850; //ms
export const GRAVITY_LEVEL_DIFF = 10; //ms
export const MAXIMUM_SPEED = 100; //ms
export const LEVEL_LINES_DIFF = 10; // lines per level
export const TOTAL_NUM_OF_COLS = NUM_OF_COLS + PREVIEW_COLS;

// Preview control symbols and labels
export const PREVIEW_CONTROL_CHARS = ["↑", "←", "↓", "→"];
export const PREVIEW_LABELS = [
  "⟳",
  "L",
  "D",
  "R",
  "I",
  "F",
  "U",
  "T",
  "Y",
  "s",
  "p",
  "a",
  "c",
  "e",
  ":",
  "u",
  "Q",
  "q",
  "i",
  "t",
  '"',
  "y",
  "E",
  "N",
  "O",
  "M",
  "H",
  "A",
];
export const NEXT_WORD = ["N", "E", "X", "T"];
export const LEVEL_WORD = ["L", "E", "V", "E", "L"];
export const SCORE_WORD = ["S", "C", "O", "R", "E"];
export const DIFFICULTY_LABEL = [
  "D",
  "I",
  "F",
  "F",
  "I",
  "C",
  "U",
  "L",
  "T",
  "Y",
];

// Demo mode settings
export const DEMO_MOVEMENTS = ["<", ">", "rotate", "<", ">", "rotate", "down"];
export const DEMO_MOVE_INTERVAL = 500; // ms between moves
export const SPLASH_SCREEN_DELAY = 1000;
export const DIFFICULTY_SELECTION_TIMEOUT = 15000; // ms
