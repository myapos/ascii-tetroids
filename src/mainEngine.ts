import type { Chamber, ShapeCoords, UserMove } from "src/types";
import isInBounds from "utils/isInBounds";
import type { Pos } from "utils/types.ts";
import rotateMatrix from "utils/rotateMatrix";
import chalk from "chalk";
import {
  REST,
  FLOOR,
  SIDE_WALL,
  LIVE,
  PREVIEW,
  EMPTY,
  MAX_CHAMBER_HEIGHT,
  GRAVITY_SPEED,
  NUM_OF_COLS,
  PREVIEW_COLS,
  GRAVITY_LEVEL_DIFF,
  LEVEL_LINES_DIFF,
} from "src/constants/constants";
import createShapes, { getShapes } from "src/shapes/createShapes";
import clone from "utils/clone";

const shapes = createShapes();

const getShapeCoords = (chamber: Chamber): ShapeCoords => {
  const shapeCoords: ShapeCoords = [];

  for (let i = 0; i < chamber.length; i++) {
    for (let j = 0; j < chamber[0].length; j++) {
      let cell = chamber[i][j];

      if (cell === LIVE) {
        shapeCoords.push([i, j]);
      }
    }
  }

  return shapeCoords;
};

const deleteShape = (shapeCoords: ShapeCoords, chamber: Chamber) => {
  const cloned = clone(chamber);
  shapeCoords.forEach((coord) => {
    cloned[coord[0]][coord[1]] = EMPTY;
  });
  return cloned;
};

const getBottomToUpFrontier = (chamber: Chamber): ShapeCoords => {
  let bottomToUpFrontier: ShapeCoords = [];
  for (let j = 0; j < chamber[0].length; j++) {
    for (let i = chamber.length - 1; i >= 0; i--) {
      const cell = chamber[i][j];
      if (cell === LIVE) {
        bottomToUpFrontier.push([i, j]);
        break;
      }
    }
  }

  return bottomToUpFrontier;
};

// will pre-check all of the coords if they can move
const canMoveDown = (chamber: Chamber, shapeCoords: ShapeCoords): boolean => {
  let canGoDown = true;

  // scan the chamber from the floor to the top
  let bottomToUpFrontier = getBottomToUpFrontier(chamber);

  // check on row down for each coord in the bottomToUpFrontier and decide if the
  // shape can go down
  canGoDown = bottomToUpFrontier.every((coord) => {
    return (
      coord[0] + 1 < chamber.length && chamber[coord[0] + 1][coord[1]] === EMPTY
    );
  });

  return canGoDown;
};

const canMoveRight = (chamber: Chamber, shapeCoords: ShapeCoords): boolean => {
  let canGoRight = true;

  let rightFrontier: ShapeCoords = [];

  for (let i = chamber.length - 1; i >= 0; i--) {
    for (let j = chamber[0].length - 1; j >= 0; j--) {
      const cell = chamber[i][j];
      if (cell === LIVE) {
        rightFrontier.push([i, j]);
        break;
      }
    }
  }

  // check for every first shapeCol that there is availabe space
  // one position after and that is in bounds

  canGoRight = rightFrontier.every((coord) => {
    return (
      coord[1] + 1 < chamber[0].length &&
      chamber[coord[0]][coord[1] + 1] === EMPTY
    );
  });

  return canGoRight;
};

const canMoveLeft = (chamber: Chamber, shapeCoords: ShapeCoords): boolean => {
  // find for each row the minimum frontier cols and check if there is
  // any available space left before it
  // if all of them have empty space then it can move left
  // otherwise no

  let canGoLeft = true;
  let leftFrontier: ShapeCoords = [];

  for (let i = 0; i < chamber.length; i++) {
    for (let j = 0; j < chamber[0].length; j++) {
      const cell = chamber[i][j];
      if (cell === LIVE) {
        leftFrontier.push([i, j]);
        break;
      }
    }
  }

  canGoLeft = leftFrontier.every((coord) => {
    return coord[1] - 1 >= 0 && chamber[coord[0]][coord[1] - 1] === EMPTY;
  });

  return canGoLeft;
};

const moveShapeDown = (chamber: Chamber): Chamber => {
  const shapeCoords = getShapeCoords(chamber);
  if (!canMoveDown(chamber, shapeCoords)) {
    return chamber;
  }
  chamber = deleteShape(shapeCoords, chamber);

  // move down each cell coord
  for (let coord of shapeCoords) {
    const [i, j] = coord;

    const newRowHeight = i + 1;

    const newPos: Pos = { y: newRowHeight, x: j };
    // check in bounds
    const isFloor = chamber[newRowHeight][j] === REST;

    if (isInBounds(newPos, chamber) && !isFloor) {
      chamber[i + 1][j] = LIVE;
    }
  }

  return clone(chamber);
};
// will find right/left Collisions to the right edge
const collidesToTheEdges = (
  chamber: Chamber,
  shapeCoords: ShapeCoords,
  UserMove: UserMove
) => {
  let maxCol = -Infinity;
  let minCol = +Infinity;

  shapeCoords.forEach((coord) => {
    const [, c] = coord;

    if (c > maxCol) {
      maxCol = c;
    }

    if (c < minCol) {
      minCol = c;
    }
  });

  return UserMove === ">" ? maxCol === chamber[0].length - 1 : minCol === 0;
};

const moveShapeLeft = (chamber: Chamber, shapeCoords: ShapeCoords): Chamber => {
  if (!canMoveLeft(chamber, shapeCoords)) {
    return chamber;
  }
  const cloned = clone(chamber);
  chamber = deleteShape(shapeCoords, chamber);
  for (const coords of shapeCoords) {
    const [i, j] = coords;
    const newCol = j - 1;
    if (!collidesToTheEdges(cloned, shapeCoords, "<")) {
      chamber[i][newCol] = LIVE;
    } else {
      // redraw in the same positions
      chamber[i][j] = LIVE;
    }
  }

  return clone(chamber);
};

const moveShapeRight = (
  chamber: Chamber,
  shapeCoords: ShapeCoords
): Chamber => {
  if (!canMoveRight(chamber, shapeCoords)) {
    return chamber;
  }
  const cloned = clone(chamber);
  chamber = deleteShape(shapeCoords, chamber);
  for (const coords of shapeCoords) {
    const [i, j] = coords;
    const newCol = j + 1;
    if (!collidesToTheEdges(cloned, shapeCoords, ">")) {
      chamber[i][newCol] = LIVE;
    } else {
      // redraw in the same positions
      chamber[i][j] = LIVE;
    }
  }

  return clone(chamber);
};

const moveShapeWithGas = (
  chamber: Chamber,
  currentUserMove: UserMove
): Chamber => {
  const shapeCoords = getShapeCoords(chamber);

  if (currentUserMove === "<") {
    chamber = moveShapeLeft(chamber, shapeCoords);
  }

  if (currentUserMove === ">") {
    chamber = moveShapeRight(chamber, shapeCoords);
  }
  return clone(chamber);
};

const restShape = (chamber: Chamber, shapeCoords: ShapeCoords) => {
  shapeCoords.forEach((coord) => {
    chamber[coord[0]][coord[1]] = REST;
  });
  return clone(chamber);
};

const arraysAreEqual = <T>(a: T[][], b: T[][]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i][0] !== b[i][0] || a[i][1] !== b[i][1]) return false;
  }
  return true;
};

const moveCursorHome = () => process.stdout.write("\x1b[H");
const hideCursor = () => process.stdout.write("\x1b[?25l");
const showCursor = () => process.stdout.write("\x1b[?25h");
const enterAltScreen = () => process.stdout.write("\x1b[?1049h");
const exitAltScreen = () => process.stdout.write("\x1b[?1049l");
const colorizeCell = (cell: string): string => {
  if (Number.isSafeInteger(parseInt(cell))) {
    return chalk.yellowBright(cell);
  }

  switch (cell) {
    case LIVE:
      return chalk.greenBright(cell);
    case REST:
      return chalk.white(cell);
    case FLOOR:
      return chalk.magentaBright(cell);
    case SIDE_WALL:
      return chalk.blue(cell);
    case EMPTY:
      return chalk.gray(cell);
    case PREVIEW:
      return chalk.gray(cell);
    case "N":
    case "E":
    case "X":
    case "T":
    case "L":
    case "E":
    case "V":
    case "E":
    case "L":
      return chalk.yellowBright(cell);
    default:
      return cell;
  }
};

const animatedLogs = async (
  chamber: Chamber,
  previewChamber: Chamber,
  frameRate: number
) => {
  const visibleRows = chamber.map((row, i) => [...row, ...previewChamber[i]]);

  moveCursorHome();
  process.stdout.write(
    visibleRows.map((row) => row.map(colorizeCell).join("")).join("\n") + "\n"
  );

  await new Promise((res) => setTimeout(res, frameRate));
};

const getShapeIdx = () => Math.floor(Math.random() * shapes.size);

const rotateShape = (chamber: Chamber) => {
  const shapeCoords = getShapeCoords(chamber);

  // If no shape, nothing to rotate
  if (shapeCoords.length === 0) return chamber;

  // Find the bounding box of LIVE cells only
  let minRow = Infinity;
  let maxRow = -Infinity;
  let minCol = Infinity;
  let maxCol = -Infinity;

  for (const [row, col] of shapeCoords) {
    minRow = Math.min(minRow, row);
    maxRow = Math.max(maxRow, row);
    minCol = Math.min(minCol, col);
    maxCol = Math.max(maxCol, col);
  }

  // Extract minimal bounding box containing only LIVE cells
  const minimalShape: Chamber = [];
  for (let i = minRow; i <= maxRow; i++) {
    const row: string[] = [];
    for (let j = minCol; j <= maxCol; j++) {
      row.push(chamber[i][j]);
    }
    minimalShape.push(row);
  }

  // Create a copy without the current shape for validation
  const chamberWithoutShape = deleteShape(shapeCoords, chamber);

  // Rotate the minimal shape
  const rotatedShape = rotateMatrix(minimalShape);

  // VALIDATE: Check if all rotated cells can be placed
  const rotatedCoords: Array<[number, number]> = [];
  for (let i = 0; i < rotatedShape.length; i++) {
    for (let j = 0; j < rotatedShape[i].length; j++) {
      if (rotatedShape[i][j] === LIVE) {
        const newRow = minRow + i;
        const newCol = minCol + j;
        rotatedCoords.push([newRow, newCol]);
      }
    }
  }

  // Check if ALL rotated cells are valid
  const canRotate = rotatedCoords.every(([row, col]) => {
    // Check bounds
    if (
      row < 0 ||
      row >= chamberWithoutShape.length ||
      col < 0 ||
      col >= chamberWithoutShape[0].length
    ) {
      return false;
    }
    // Check if cell is empty (no rested shape there)
    if (chamberWithoutShape[row][col] !== EMPTY) {
      return false;
    }
    return true;
  });

  // Only apply rotation if all cells are valid
  if (canRotate) {
    for (const [row, col] of rotatedCoords) {
      chamberWithoutShape[row][col] = LIVE;
    }
    return chamberWithoutShape;
  }

  // If rotation is invalid, restore the original shape and return unchanged
  for (const [row, col] of shapeCoords) {
    chamber[row][col] = LIVE;
  }
  return chamber;
};

const addShape = (shapeIdx: number, chamber: Chamber): Chamber => {
  const shape = shapes.get(shapeIdx)!;
  // delete the length of the shape from champer
  chamber.splice(0, shape.length);
  chamber.unshift(...shape);
  return chamber;
};

const emptyPreviewArea = (previewChamber: Chamber) => {
  for (let i = 0; i < previewChamber.length; i++) {
    for (let j = 0; j < previewChamber[0].length; j++) {
      previewChamber[i][j] = PREVIEW;
    }
  }
};

const addPreviewNextShape = (
  shapeIdx: number,
  previewChamber: Chamber,
  curLevel: number
): Chamber => {
  const emptyRow = [
    ...Array.from({ length: previewChamber[0].length }).map(() => PREVIEW),
  ];

  const shape = getShapes().get(shapeIdx)!;
  emptyPreviewArea(previewChamber);

  // add a row with the word 'NEXT'
  const nextWord = ["N", "E", "X", "T"];
  const nextRow = [];

  for (let i = 0; i < previewChamber[0].length; i++) {
    if (i < nextWord.length) {
      nextRow.push(nextWord[i]);
    } else {
      nextRow.push(PREVIEW);
    }
  }

  shape.unshift(nextRow);

  // add an empty row
  shape.push(emptyRow);

  // add a row with the word 'LEVEL'
  const levelWord = ["L", "E", "V", "E", "L"];
  const levelRow = [];

  for (let i = 0; i < previewChamber[0].length; i++) {
    if (i < nextWord.length) {
      levelRow.push(levelWord[i]);
    } else {
      levelRow.push(PREVIEW);
    }
  }

  shape.push(levelWord);
  // add cur level
  const curLevelInfo = [curLevel.toString()];
  shape.push(curLevelInfo);

  // write the shape with the next word to the chamber
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      const shapeChar = shape[i][j];

      if (typeof shapeChar !== "undefined") {
        previewChamber[i][j] =
          shapeChar === LIVE ||
          nextWord.includes(shapeChar) ||
          levelWord.includes(shapeChar) ||
          Number.isSafeInteger(parseInt(shapeChar))
            ? shapeChar
            : PREVIEW;
      }
    }
  }

  return previewChamber;
};
// it will create a 2D chamber of MAX_WIDTH and MAX_ROWS with empty cell
// and add shape to the start
const initializeChamber = (): Chamber => {
  let chamber: Chamber = Array.from({ length: MAX_CHAMBER_HEIGHT - 1 }).map(
    () => {
      return Array.from({ length: NUM_OF_COLS }).map((_, colIdx: number) => {
        const isLeftSide = colIdx === 0;
        const isRightSide = colIdx === NUM_OF_COLS - 1;
        if (isLeftSide || isRightSide) return SIDE_WALL;
        return EMPTY;
      });
    }
  );

  // add FLOOR
  const floorRow = Array.from({ length: NUM_OF_COLS }).map(() => FLOOR);

  chamber.push(floorRow);

  const shapeIdx = getShapeIdx();
  chamber = addShape(shapeIdx, chamber);

  return chamber;
};

const initializePreviewChamber = (): Chamber => {
  let previewChamber: Chamber = Array.from({ length: MAX_CHAMBER_HEIGHT }).map(
    () => {
      return Array.from({ length: PREVIEW_COLS }).map(() => PREVIEW);
    }
  );

  return previewChamber;
};

const checkFilledRows = (
  chamber: Chamber
): { chamber: Chamber; numOfFilledRows: number } => {
  let numOfFilledRows = 0;
  for (let i = 0; i < chamber.length; i++) {
    let filledCells = 0;
    for (let j = 0; j < chamber[0].length; j++) {
      if (chamber[i][j] === REST) {
        filledCells++;
      }
    }

    // remove the side edges
    const isFilled = filledCells === chamber[0].length - 2;
    if (isFilled) {
      numOfFilledRows++;
      //1. remove row from that place
      chamber.splice(i, 1);
      //2. add an empty row to the beginning
      const newEmptyRow: string[] = Array.from({ length: NUM_OF_COLS }).map(
        () => EMPTY
      );
      chamber.unshift(newEmptyRow);
    }
  }

  return { numOfFilledRows, chamber: clone(chamber) };
};

const getTowerHeight = (chamber: Chamber) => {
  // skip floor row at the bottom
  for (let i = 0; i < chamber.length - 1; i++) {
    if (chamber[i].some((cell) => cell === REST)) {
      return chamber.length - 1 - i; // subtract floor row
    }
  }
  return 0;
};

const checkIfPlayerLost = (chamber: Chamber, shapeIdx: number): boolean => {
  let towerHeight = getTowerHeight(chamber);
  let totalHeight = towerHeight + shapes.get(shapeIdx)!.length;
  let hasReachedToTop = totalHeight >= chamber.length - 1; // removes the floor

  return hasReachedToTop;
};

const mainEngine = async () => {
  let gameChamber: Chamber = initializeChamber();
  let previewChamber: Chamber = initializePreviewChamber();
  let chamber: Chamber = [...gameChamber];

  const FRAME_RATE = 8.33; // ~120 FPS
  const keyQueue: string[] = [];
  const MAX_QUEUE_SIZE = 2000;
  let isPaused = false; // Pause state
  let totalNumOfFilledRows = 0;
  let curGravitySpeed = GRAVITY_SPEED;
  let curLevel = 1;

  const isInDebugMode = typeof process.stdin.setRawMode === "undefined";

  if (!isInDebugMode) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (key) => {
      if (key === "\u0003") {
        // Ctrl+C to exit
        process.exit();
      }

      // Handle pause/resume with 'p' or space key
      if (key === "p" || key === "P" || key === " ") {
        isPaused = !isPaused;
        if (isPaused) {
          console.clear();
          console.log("GAME PAUSED - Press 'p' or space to resume");
        }
        return;
      }

      const now = Date.now();
      let keyType = "";

      if (key === "\u001b[D") {
        keyType = "<";
      } else if (key === "\u001b[C") {
        keyType = ">";
      } else if (key === "\u001b[B") {
        keyType = "down";
      } else if (key === "\u001b[A") {
        keyType = "rotate";
      }

      // Add key to queue immediately with no debounce
      if (keyType && keyQueue.length < MAX_QUEUE_SIZE) {
        keyQueue.push(keyType);
      }
    });
  }
  // Enter alternate screen buffer and hide cursor
  enterAltScreen();
  hideCursor();

  let lastGravityTime = 0;
  let hasRested: boolean = false;
  let newShapeIdx = getShapeIdx();

  while (true) {
    previewChamber = addPreviewNextShape(newShapeIdx, previewChamber, curLevel);
    if (hasRested) {
      newShapeIdx = getShapeIdx();
      hasRested = false;
    }

    if (isPaused) {
      await new Promise((res) => setTimeout(res, 50));
      continue;
    }

    // Process all queued input
    while (keyQueue.length > 0) {
      const move = keyQueue.shift()!;

      if (move === "rotate") {
        chamber = rotateShape(chamber);
      } else if (move === "<" || move === ">") {
        chamber = moveShapeWithGas(chamber, move);
      } else if (move === "down") {
        chamber = moveShapeDown(chamber);
      }
    }

    // Apply gravity
    const now = Date.now();
    if (now - lastGravityTime > curGravitySpeed) {
      lastGravityTime = now;

      const shapeCoordsBefore = getShapeCoords(chamber);
      chamber = moveShapeDown(chamber);
      const shapeCoordsAfter = getShapeCoords(chamber);

      if (!arraysAreEqual(shapeCoordsBefore, shapeCoordsAfter)) {
        // Shape moved down successfully
      } else {
        // Could not move down → rest the shape
        chamber = restShape(chamber, shapeCoordsAfter);
        chamber = addShape(newShapeIdx, chamber);
        keyQueue.length = 0;
        const { numOfFilledRows, chamber: newChamb } = checkFilledRows(chamber);
        totalNumOfFilledRows += numOfFilledRows;
        const shouldIncreaseGravityLevel =
          totalNumOfFilledRows >= LEVEL_LINES_DIFF;

        if (shouldIncreaseGravityLevel) {
          curGravitySpeed -= GRAVITY_LEVEL_DIFF;
          totalNumOfFilledRows = totalNumOfFilledRows % LEVEL_LINES_DIFF; // reset
          curLevel++;
        }

        chamber = newChamb;
        const lost = checkIfPlayerLost(chamber, newShapeIdx);
        hasRested = true;

        if (lost) {
          exitAltScreen();
          showCursor();
          console.log(chalk.yellowBright("YOU LOST!! Try again"));
          break;
        }
      }
    }

    // Render once per frame
    await animatedLogs(chamber, previewChamber, FRAME_RATE);
  }
};

export default mainEngine;
