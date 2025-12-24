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
type ShapeCoords = number[][];
type StateKey = string;

const horizontalLine: Shape = [[".", ".", LIVE, LIVE, LIVE, LIVE, "."]];
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
  numOfCols: number = 7,
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
  chamber = createRows(chamber, 3, 7, highestRockOrFloorIdx);
  chamber.unshift(...shapeToAdd);

  return clone(chamber);
};

const originalLog = console.log;
let loggedLines = 0;

console.log = (...args) => {
  const text = args.join(" ");
  loggedLines += text.split("\n").length;
  originalLog(...args);
};

const arraysAreEqual = <T>(a: T[][], b: T[][]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i][0] !== b[i][0] || a[i][1] !== b[i][1]) return false;
  }
  return true;
};

const animatedLogs = async (chamber: Chamber) => {
  console.clear();
  printMap(chamber);
  return await new Promise((res) => {
    setTimeout(res, 850);
  });
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

const getSurfaceProfile = (chamber: Chamber): number[] => {
  const heights: number[] = Array.from({ length: chamber[0].length }).map(
    () => Infinity
  );

  for (let r = 0; r < chamber.length; r++) {
    for (let c = 0; c < chamber[0].length; c++) {
      const cell = chamber[r][c];
      if (cell === REST) {
        heights[c] = Math.min(heights[c], r);
      }
    }
  }

  return heights.map((r) => (r === Infinity ? 0 : r));
};

const puzzle2 = async (file: string): Promise<number> => {
  const input = (await readFile(file, "string")) as string;

  const gasDir = input.split("") as GasDir[];
  let chamber: Chamber = [];
  const WHEN_TO_STOP = 1_000_000_000_000;
  let counter = 0;
  let curGasDirectIdx = -1;
  let shapeIdx = 0;
  let curMove: Move = "gas";
  const enableLogs = false;

  chamber = prepareChamberForNewShape(chamber, shapeIdx, 0);
  const floor = Array.from({ length: 7 }).map(() => FLOOR);
  chamber.push(floor);
  const seen = new Map<StateKey, { rockCount: number; height: number }>();
  let cycleFound = false;
  let skippedHeight = 0;

  while (counter < WHEN_TO_STOP) {
    if (curGasDirectIdx === gasDir.length - 1) {
      // start over
      curGasDirectIdx = -1;
    }

    if (shapeIdx === shapes.size - 1) {
      // start over
      shapeIdx = -1;
    }

    if (curMove === "gas") {
      curGasDirectIdx++;
      const currentGasDir: GasDir = gasDir[curGasDirectIdx];
      chamber = moveShapeWithGas(chamber, currentGasDir);
      enableLogs && (await animatedLogs(chamber));
      curMove = "down";
      continue;
    }

    if (curMove === "down") {
      const shapeCoordsBefore = getShapeCoords(chamber);
      chamber = moveShapeDown(chamber);
      const shapeCoordsAfter = getShapeCoords(chamber);

      if (!arraysAreEqual(shapeCoordsBefore, shapeCoordsAfter)) {
        // Shape moved down successfully
        curMove = "gas";
        enableLogs && (await animatedLogs(chamber));
        continue;
      }

      // Could not move down → rest the shape
      chamber = restShape(chamber, shapeCoordsAfter);
      shapeIdx++;
      chamber = prepareChamberForNewShape(
        chamber,
        shapeIdx,
        0,
        shapeCoordsAfter
      );
      counter++;

      const surfaceProfile = getSurfaceProfile(chamber);
      const key =
        shapeIdx + "|" + curGasDirectIdx + "|" + surfaceProfile.join(",");

      if (!cycleFound && seen.has(key)) {
        // console.log("cycle detected", seen.get(key));
        cycleFound = true;

        const prev = seen.get(key)!;

        const cycleRocks = counter - prev.rockCount;
        const cycleHeight = getTowerHeight(chamber) - prev.height;
        const remaining = WHEN_TO_STOP - counter;
        const cycles = Math.floor(remaining / cycleRocks);
        counter += cycles * cycleRocks;
        skippedHeight += cycles * cycleHeight;
        cycleFound = true;
      } else {
        seen.set(key, {
          rockCount: counter,
          height: getTowerHeight(chamber),
        });
      }

      curMove = "gas";
      continue;
    }
  }
  return getTowerHeight(chamber) + skippedHeight;
};

export default puzzle2;
