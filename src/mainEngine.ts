import type { Shape, Chamber, ShapeCoords, UserMove } from "src/types";
import isInBounds from "utils/isInBounds";
import type { Pos } from "utils/types.ts";
import L from "src/shapes/L";
import cross from "src/shapes/cross";
import verticalLine from "src/shapes/verticalLine";
import horizontalLine from "src/shapes/horizontalLine";
import square from "src/shapes/square";
import rotateMatrix from "utils/rotateMatrix";
import {
  REST,
  FLOOR,
  LIVE,
  EMPTY,
  MAX_CHAMBER_HEIGHT,
} from "src/constants/constants";

const shapes = new Map<number, Shape>();
const SPEED = 250; //ms
const NUM_OF_COLS = 30;

shapes.set(0, horizontalLine);
shapes.set(1, cross);
shapes.set(2, L);
shapes.set(3, verticalLine);
shapes.set(4, square);

// Pad a shape to match the desired width by adding empty cells
const padShape = (shape: Shape, targetWidth: number): Shape => {
  return shape.map((row) => {
    const currentWidth = row.length;
    const totalPadding = targetWidth - currentWidth;
    const leftPad = Math.floor(totalPadding / 2);
    const rightPad = totalPadding - leftPad;

    return [
      ...Array(leftPad).fill(EMPTY),
      ...row,
      ...Array(rightPad).fill(EMPTY),
    ];
  });
};

// Pad all shapes to match NUM_OF_COLS
for (const [key, shape] of shapes.entries()) {
  shapes.set(key, padShape(shape, NUM_OF_COLS));
}

const createRows = (
  chamber: Chamber,
  numOfRows: number = 1,
  numOfCols: number = NUM_OF_COLS,
  idxToAddNewPart: number,
  charToAdd = EMPTY
): Chamber => {
  const newPartOfChamper = Array.from({ length: numOfRows }).map((row) =>
    Array.from({ length: numOfCols }).map(() => charToAdd)
  );

  chamber = [
    ...chamber.slice(0, idxToAddNewPart),
    ...newPartOfChamper,
    ...chamber.slice(idxToAddNewPart),
  ];
  return chamber;
};

const clone = (chamber: Chamber): Chamber => chamber.map((row) => [...row]);

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

const prepareChamberForNewShape = (
  chamber: Chamber,
  shapeIdx: number,
  highestRockOrFloorIdx: number,
  shapeCoords?: ShapeCoords
): Chamber => {
  const shapeToAdd = shapes.get(shapeIdx)!;
  const isInitializing = chamber.length === 0;

  if (!isInitializing && shapeCoords) {
    const firstNonEmptyRow = chamber.findIndex((row) =>
      row.some((cell) => cell === REST || cell === LIVE)
    );
    if (firstNonEmptyRow > 0) {
      chamber.splice(0, firstNonEmptyRow); // drop only truly empty rows
    }
  }
  chamber = createRows(chamber, 3, NUM_OF_COLS, highestRockOrFloorIdx);
  chamber.unshift(...shapeToAdd);

  const floor = Array.from({ length: NUM_OF_COLS }).map(() => FLOOR);
  chamber.push(floor);

  return clone(chamber);
};

const arraysAreEqual = <T>(a: T[][], b: T[][]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i][0] !== b[i][0] || a[i][1] !== b[i][1]) return false;
  }
  return true;
};

const animatedLogs = async (chamber: Chamber, speed: number) => {
  const shapeCoords = getShapeCoords(chamber);
  const highestShapeRow = Math.min(...shapeCoords.map(([r]) => r)); // topmost row of shape
  const MAX_HEIGHT = 30;

  // window: from topRow to topRow + MAX_HEIGHT
  let topRow = Math.max(0, highestShapeRow - 2); // small margin above shape
  if (topRow + MAX_CHAMBER_HEIGHT > chamber.length) {
    topRow = chamber.length - MAX_CHAMBER_HEIGHT;
  }
  topRow = Math.max(0, topRow); // safety

  const visibleRows = chamber.slice(topRow, topRow + MAX_CHAMBER_HEIGHT);

  process.stdout.write("\x1b[H"); // move cursor to top-left
  process.stdout.write(
    visibleRows.map((row) => row.join("")).join("\n") + "\n"
  );

  await new Promise((res) => setTimeout(res, speed));
};

const getShapeIdx = () => Math.floor(Math.random() * (shapes.size - 1));

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
// it will create a 2D chamber of MAX_WIDTH and MAX_ROWS with empty cell
// and add shape to the start
const initializeChamber = (): Chamber => {
  let chamber: Chamber = Array.from({ length: MAX_CHAMBER_HEIGHT }).map(() => {
    return Array.from({ length: NUM_OF_COLS }).map(() => EMPTY);
  });
  // for (let i = 0; i < MAX_CHAMBER_HEIGHT; i++) {
  //   for (let j = 0; j < NUM_OF_COLS; j++) {
  //     chamber[i][j] = EMPTY;
  //   }
  // }

  const shapeIdx = getShapeIdx();
  chamber = addShape(shapeIdx, chamber);

  return chamber;
};

const checkFilledRows = (chamber: Chamber): Chamber => {
  for (let i = 0; i < chamber.length; i++) {
    let filledCells = 0;
    for (let j = 0; j < chamber[0].length; j++) {
      if (chamber[i][j] === REST) {
        filledCells++;
      }
    }

    const isFilledRow = filledCells === chamber[0].length;
    if (isFilledRow) {
      //1. remove row from that place
      chamber.splice(i, 1);
      //2. add an empty row to the beginning
      const newEmptyRow: string[] = Array.from({ length: NUM_OF_COLS }).map(
        () => EMPTY
      );
      chamber.unshift(newEmptyRow);
    }
  }

  return clone(chamber);
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
  let chamber: Chamber = [];
  const enableLogs = true;
  let curSpeed = SPEED;
  chamber = initializeChamber();
  // chamber = prepareChamberForNewShape(chamber, getShapeIdx(), 0);

  // Queue for key presses - process one per cycle
  const keyQueue: string[] = [];
  let lastMoveTime = 0;
  const MOVE_DELAY = 2; // ms between each move
  const MAX_QUEUE_SIZE = 3; // Prevent queue buildup
  const lastKeyPressTime: Record<string, number> = {}; // Debounce repeated keys
  const DEBOUNCE_TIME = 0; // ms between same key presses

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  process.stdin.on("data", (key) => {
    if (key === "\u0003") {
      // Ctrl+C to exit
      process.exit();
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

    // Debounce: only add key if enough time passed since last press of same key
    if (
      keyType &&
      (!lastKeyPressTime[keyType] ||
        now - lastKeyPressTime[keyType] > DEBOUNCE_TIME)
    ) {
      lastKeyPressTime[keyType] = now;

      // Only add to queue if it's not already full
      if (keyQueue.length < MAX_QUEUE_SIZE) {
        keyQueue.push(keyType);
      }
    }
  });

  // clear console on start
  console.clear();

  let lastGravityTime = 0;

  while (true) {
    // INNER LOOP: Process lateral movement and rotation as fast as debounced
    let innerNow = Date.now();
    while (keyQueue.length > 0 && innerNow - lastMoveTime > MOVE_DELAY) {
      const move = keyQueue.shift()!; // Remove and process one key
      lastMoveTime = innerNow;

      if (move === "rotate") {
        chamber = rotateShape(chamber);
        enableLogs && (await animatedLogs(chamber, 20)); // Show rotation immediately
      } else if (move === "<" || move === ">") {
        chamber = moveShapeWithGas(chamber, move);
        enableLogs && (await animatedLogs(chamber, 10)); // Faster display for lateral movement
      } else if (move === "down") {
        // Actually move the piece down when down key is pressed
        const shapeCoordsBefore = getShapeCoords(chamber);
        chamber = moveShapeDown(chamber);
        const shapeCoordsAfter = getShapeCoords(chamber);

        if (!arraysAreEqual(shapeCoordsBefore, shapeCoordsAfter)) {
          enableLogs && (await animatedLogs(chamber, 10));
        }
      }

      // Update time inside loop so multiple moves can process
      innerNow = Date.now();
    }

    // OUTER LOOP: Apply gravity at normal speed
    const now = Date.now();
    if (now - lastGravityTime > SPEED) {
      lastGravityTime = now;

      // move down
      const shapeCoordsBefore = getShapeCoords(chamber);
      chamber = moveShapeDown(chamber);
      const shapeCoordsAfter = getShapeCoords(chamber);

      if (!arraysAreEqual(shapeCoordsBefore, shapeCoordsAfter)) {
        // Shape moved down successfully
        enableLogs && (await animatedLogs(chamber, curSpeed));
      } else {
        // Could not move down → rest the shape
        chamber = restShape(chamber, shapeCoordsAfter);
        const newShapeIdx = getShapeIdx();
        chamber = addShape(newShapeIdx, chamber);
        keyQueue.length = 0; // Clear the queue when new shape appears
        chamber = checkFilledRows(chamber);
        const lost = checkIfPlayerLost(chamber, newShapeIdx);

        if (lost) {
          console.log("YOU LOST!! Try again");

          break;
        }
      }
    }
  }
};

export default mainEngine;
