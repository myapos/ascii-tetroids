export const LIVE = "●";
export const REST = "◉";
export const FLOOR = "━";
export const SIDE_WALL = "║";
export const EMPTY = "○"; // Filled black circle for visibility
export const PREVIEW = " ";
export const PREVIEW_SHAPE = "O"; // Shape character for preview chamber

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
export const SPLASH_SCREEN_DELAY = 10000;
export const DIFFICULTY_SELECTION_TIMEOUT = 15000; // ms
// UI and gameplay timings
export const FRAME_RATE = 50; // ms per frame (1000/50 = 20 FPS)
export const MAX_QUEUE_SIZE = 2000; // Maximum queued input events
export const MENU_DEBOUNCE_TIME = 500; // ms - prevent menu from showing multiple times
export const DEMO_MOVE_DELAY = 650; // ms - slow down demo moves to be visible
export const GAME_OVER_CHECK_INTERVAL = 100; // ms - check game over state
export const PAUSE_CHECK_INTERVAL = 50; // ms - check pause state
export const DIFFICULTY_MENU_CLEAR_LINES = 12; // lines to clear after difficulty selection
export const SOUND_MOVE_DEBOUNCE = 100; // ms - debounce move sound effects
export const SOUND_BLOCK_REST_DEBOUNCE = 50; // ms - debounce block rest sound
export const AUDIO_VOLUME_UPDATE_DELAY = 100; // ms - delay for volume change updates
