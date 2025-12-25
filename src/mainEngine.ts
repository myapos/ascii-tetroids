import readFile from "utils/readFile";
import printMap from "utils/printMap";
import isInBounds from "utils/isInBounds";
import type { Pos } from "utils/types.ts";

type Chamber = string[][];
type Shape = string[][];

const REST = "#";
const FLOOR = "-";
const LIVE = "@";
const EMPTY = ".";
const horizontalLine: Shape = [[".", ".", LIVE, LIVE, LIVE, LIVE, "."]];

type ShapeCoords = number[][];

const cross: Shape = [
  [".", ".", ".", LIVE, ".", ".", "."],
  [".", ".", LIVE, LIVE, LIVE, ".", "."],
  [".", ".", ".", LIVE, ".", ".", "."],
];

const L: Shape = [
  [".", ".", ".", ".", LIVE, ".", "."],
  [".", ".", ".", ".", LIVE, ".", "."],
  [".", ".", LIVE, LIVE, LIVE, ".", "."],
];

const verticalLine: Shape = [
  [".", ".", LIVE, ".", ".", ".", "."],
  [".", ".", LIVE, ".", ".", ".", "."],
  [".", ".", LIVE, ".", ".", ".", "."],
  [".", ".", LIVE, ".", ".", ".", "."],
];

const square: Shape = [
  [".", ".", LIVE, LIVE, ".", ".", "."],
  [".", ".", LIVE, LIVE, ".", ".", "."],
];

const shapes = new Map<number, Shape>();
const SPEED = 250; //ms
const NUM_OF_COLS = 15;

shapes.set(0, horizontalLine);
shapes.set(1, cross);
shapes.set(2, L);
shapes.set(3, verticalLine);
shapes.set(4, square);
type GasDir = "<" | ">";
type Move = "gas" | "down";

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
  gasDir: GasDir
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

  return gasDir === ">" ? maxCol === chamber[0].length - 1 : minCol === 0;
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

const moveShapeWithGas = (chamber: Chamber, currentGasDir: GasDir): Chamber => {
  const shapeCoords = getShapeCoords(chamber);

  if (currentGasDir === "<") {
    chamber = moveShapeLeft(chamber, shapeCoords);
  }

  if (currentGasDir === ">") {
    chamber = moveShapeRight(chamber, shapeCoords);
  }
  return clone(chamber);
};

const restShape = (chamber: Chamber, shapeCoords: ShapeCoords) => {
  shapeCoords.forEach((coord) => {
    chamber[coord[0]][coord[1]] = "#";
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
  if (topRow + MAX_HEIGHT > chamber.length) {
    topRow = chamber.length - MAX_HEIGHT;
  }
  topRow = Math.max(0, topRow); // safety

  const visibleRows = chamber.slice(topRow, topRow + MAX_HEIGHT);

  process.stdout.write("\x1b[H"); // move cursor to top-left
  process.stdout.write(
    visibleRows.map((row) => row.join("")).join("\n") + "\n"
  );

  await new Promise((res) => setTimeout(res, speed));
};

const getShapeIdx = () => Math.floor(Math.random() * (shapes.size - 1));

const mainEngine = async () => {
  let chamber: Chamber = [];
  const enableLogs = true;
  let curSpeed = SPEED;

  chamber = prepareChamberForNewShape(chamber, getShapeIdx(), 0);
  const floor = Array.from({ length: NUM_OF_COLS }).map(() => FLOOR);
  chamber.push(floor);
  let userMove: GasDir | "down" | "rotate" | null = null;

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  process.stdin.on("data", (key) => {
    if (key === "\u0003") {
      // Ctrl+C to exit
      process.exit();
    } else if (key === "\u001b[D") {
      // Left arrow
      userMove = "<";
    } else if (key === "\u001b[C") {
      // Right arrow
      userMove = ">";
    } else if (key === "\u001b[B") {
      // Down arrow
      userMove = "down";
    } else if (key === "\u001b[A") {
      // Up arrow (you could use this for rotation)
      userMove = "rotate";
    }
  });

  // clear console on start
  console.clear();
  while (true) {
    if (userMove === "<" || userMove === ">") {
      chamber = moveShapeWithGas(chamber, userMove);
      enableLogs && (await animatedLogs(chamber, curSpeed));
      userMove = null; // reset after moving
      continue;
    }

    if (userMove === "down") {
      curSpeed = SPEED / 4;
    } else {
      curSpeed = SPEED;
    }

    // move down
    const shapeCoordsBefore = getShapeCoords(chamber);
    chamber = moveShapeDown(chamber);
    const shapeCoordsAfter = getShapeCoords(chamber);

    if (!arraysAreEqual(shapeCoordsBefore, shapeCoordsAfter)) {
      // Shape moved down successfully
      enableLogs && (await animatedLogs(chamber, curSpeed));
      continue;
    }

    // Could not move down → rest the shape
    chamber = restShape(chamber, shapeCoordsAfter);
    chamber = prepareChamberForNewShape(
      chamber,
      getShapeIdx(),
      0,
      shapeCoordsAfter
    );
    userMove = null;
  }
};

export default mainEngine;
