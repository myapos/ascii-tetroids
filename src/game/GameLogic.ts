import type { Chamber, ShapeCoords, UserMove, Pos } from "src/types";
import isInBounds from "src/utils/isInBounds";
import rotateMatrix from "src/utils/rotateMatrix";
import clone from "src/utils/clone";
import {
  EMPTY,
  LIVE,
  REST,
  MAX_CHAMBER_HEIGHT,
  NUM_OF_COLS,
  FLOOR,
  SIDE_WALL,
} from "src/constants/constants";
import createShapes from "src/shapes/createShapes";
import type { Shape } from "src/types";

export class GameLogic {
  private shapes: Map<number, Shape>;

  constructor() {
    this.shapes = createShapes();
  }

  getShapes(): Map<number, Shape> {
    return this.shapes;
  }
  getShapeCoords(chamber: Chamber): ShapeCoords {
    const shapeCoords: ShapeCoords = [];

    for (let i = 0; i < chamber.length; i++) {
      for (let j = 0; j < chamber[0].length; j++) {
        const cell = chamber[i][j];

        if (cell === LIVE) {
          shapeCoords.push([i, j]);
        }
      }
    }

    return shapeCoords;
  }

  deleteShape(shapeCoords: ShapeCoords, chamber: Chamber) {
    const cloned = clone(chamber);
    shapeCoords.forEach((coord) => {
      cloned[coord[0]][coord[1]] = EMPTY;
    });
    return cloned;
  }

  restShape(chamber: Chamber, shapeCoords: ShapeCoords) {
    shapeCoords.forEach((coord) => {
      chamber[coord[0]][coord[1]] = REST;
    });
    return clone(chamber);
  }

  arraysAreEqual<T>(a: T[][], b: T[][]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i][0] !== b[i][0] || a[i][1] !== b[i][1]) return false;
    }
    return true;
  }

  private getBottomToUpFrontier(chamber: Chamber): ShapeCoords {
    const bottomToUpFrontier: ShapeCoords = [];
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
  }

  canMoveDown(chamber: Chamber): boolean {
    const bottomToUpFrontier = this.getBottomToUpFrontier(chamber);

    return bottomToUpFrontier.every((coord) => {
      return (
        coord[0] + 1 < chamber.length &&
        chamber[coord[0] + 1][coord[1]] === EMPTY
      );
    });
  }

  moveShapeDown = (chamber: Chamber): Chamber => {
    const shapeCoords = this.getShapeCoords(chamber);
    if (!this.canMoveDown(chamber)) {
      return chamber;
    }
    chamber = this.deleteShape(shapeCoords, chamber);

    // move down each cell coord
    for (const coord of shapeCoords) {
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

  private getRightFrontier(chamber: Chamber): ShapeCoords {
    const rightFrontier: ShapeCoords = [];

    for (let i = chamber.length - 1; i >= 0; i--) {
      for (let j = chamber[0].length - 1; j >= 0; j--) {
        const cell = chamber[i][j];
        if (cell === LIVE) {
          rightFrontier.push([i, j]);
          break;
        }
      }
    }

    return rightFrontier;
  }

  canMoveRight(chamber: Chamber): boolean {
    const rightFrontier = this.getRightFrontier(chamber);

    return rightFrontier.every((coord) => {
      return (
        coord[1] + 1 < chamber[0].length &&
        chamber[coord[0]][coord[1] + 1] === EMPTY
      );
    });
  }

  private getLeftFrontier(chamber: Chamber): ShapeCoords {
    const leftFrontier: ShapeCoords = [];

    for (let i = 0; i < chamber.length; i++) {
      for (let j = 0; j < chamber[0].length; j++) {
        const cell = chamber[i][j];
        if (cell === LIVE) {
          leftFrontier.push([i, j]);
          break;
        }
      }
    }

    return leftFrontier;
  }
  // will find right/left Collisions to the right edge
  collidesToTheEdges = (
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

  canMoveLeft(chamber: Chamber): boolean {
    const leftFrontier = this.getLeftFrontier(chamber);

    return leftFrontier.every((coord) => {
      return coord[1] - 1 >= 0 && chamber[coord[0]][coord[1] - 1] === EMPTY;
    });
  }

  moveShapeLeft(chamber: Chamber, shapeCoords: ShapeCoords): Chamber {
    if (!this.canMoveLeft(chamber)) {
      return chamber;
    }

    chamber = this.deleteShape(shapeCoords, chamber);

    for (const coords of shapeCoords) {
      const [i, j] = coords;
      const newCol = j - 1;
      if (newCol >= 0 && chamber[i][newCol] === EMPTY) {
        chamber[i][newCol] = LIVE;
      } else {
        // Keep in same position if can't move
        chamber[i][j] = LIVE;
      }
    }

    return clone(chamber);
  }

  moveShapeRight(chamber: Chamber, shapeCoords: ShapeCoords): Chamber {
    if (!this.canMoveRight(chamber)) {
      return chamber;
    }

    chamber = this.deleteShape(shapeCoords, chamber);

    for (const coords of shapeCoords) {
      const [i, j] = coords;
      const newCol = j + 1;
      if (newCol < chamber[0].length && chamber[i][newCol] === EMPTY) {
        chamber[i][newCol] = LIVE;
      } else {
        // Keep in same position if can't move
        chamber[i][j] = LIVE;
      }
    }

    return clone(chamber);
  }

  moveShapeWithGas(chamber: Chamber, userMove: string): Chamber {
    const shapeCoords = this.getShapeCoords(chamber);

    if (userMove === "<") {
      return this.moveShapeLeft(chamber, shapeCoords);
    }

    if (userMove === ">") {
      return this.moveShapeRight(chamber, shapeCoords);
    }

    return chamber;
  }

  rotateShape(chamber: Chamber): Chamber {
    const shapeCoords = this.getShapeCoords(chamber);

    if (shapeCoords.length === 0) return chamber;

    let minRow = Infinity;
    let maxRow = -Infinity;
    let minCol = Infinity;
    let maxCol = -Infinity;

    // Find bounding box, but exclude wall columns (0 and NUM_OF_COLS-1)
    for (const [row, col] of shapeCoords) {
      minRow = Math.min(minRow, row);
      maxRow = Math.max(maxRow, row);
      // Only include columns that are NOT walls
      if (col !== 0 && col !== NUM_OF_COLS - 1) {
        minCol = Math.min(minCol, col);
        maxCol = Math.max(maxCol, col);
      }
    }

    // If no valid columns found (shouldn't happen), return unchanged
    if (minCol === Infinity || maxCol === -Infinity) {
      return chamber;
    }

    // Extract minimal shape EXCLUDING the wall columns
    const minimalShape: Chamber = [];
    for (let i = minRow; i <= maxRow; i++) {
      const row: string[] = [];
      for (let j = minCol; j <= maxCol; j++) {
        row.push(chamber[i][j]);
      }
      minimalShape.push(row);
    }

    // Rotate the minimal shape
    const rotatedShape = rotateMatrix(minimalShape);
    const rotatedHeight = rotatedShape.length;
    const rotatedWidth = rotatedShape[0]?.length || 0;

    // Try to keep shape roughly in same column area, but ensure it fits within bounds
    const originalCenterCol = minCol + Math.floor((maxCol - minCol) / 2);
    let newMinCol = originalCenterCol - Math.floor((rotatedWidth - 1) / 2);

    // Clamp to valid bounds (column 1 is first playable after left wall, NUM_OF_COLS-2 is last before right wall)
    newMinCol = Math.max(
      1,
      Math.min(newMinCol, NUM_OF_COLS - rotatedWidth - 1)
    );

    const chamberWithoutShape = this.deleteShape(shapeCoords, chamber);

    // Collect rotated coordinates
    const rotatedCoords: Array<[number, number]> = [];
    for (let i = 0; i < rotatedHeight; i++) {
      for (let j = 0; j < rotatedWidth; j++) {
        if (rotatedShape[i][j] === LIVE) {
          const newRow = minRow + i;
          const newCol = newMinCol + j;
          rotatedCoords.push([newRow, newCol]);
        }
      }
    }

    // Check if all rotated positions are valid
    const canRotate = rotatedCoords.every(([row, col]) => {
      if (
        row < 0 ||
        row >= chamberWithoutShape.length ||
        col < 0 ||
        col >= chamberWithoutShape[0].length
      ) {
        return false;
      }
      if (chamberWithoutShape[row][col] !== EMPTY) {
        return false;
      }
      return true;
    });

    if (canRotate) {
      for (const [row, col] of rotatedCoords) {
        chamberWithoutShape[row][col] = LIVE;
      }
      return chamberWithoutShape;
    }

    // Rotation not possible, return original chamber with shape
    for (const [row, col] of shapeCoords) {
      chamber[row][col] = LIVE;
    }

    return chamber;
  }

  checkFilledRows(
    chamber: Chamber,
    numOfCols: number
  ): { chamber: Chamber; numOfFilledRows: number } {
    let numOfFilledRows = 0;
    for (let i = 0; i < chamber.length; i++) {
      let filledCells = 0;
      for (let j = 0; j < chamber[0].length; j++) {
        if (chamber[i][j] === REST) {
          filledCells++;
        }
      }

      const isFilled = filledCells === numOfCols - 2;
      if (isFilled) {
        numOfFilledRows++;
        chamber.splice(i, 1);
        const newEmptyRow: string[] = Array.from({ length: numOfCols }).map(
          () => EMPTY
        );
        chamber.unshift(newEmptyRow);
      }
    }

    return { numOfFilledRows, chamber: clone(chamber) };
  }

  getTowerHeight(chamber: Chamber): number {
    for (let i = 0; i < chamber.length - 1; i++) {
      if (chamber[i].some((cell) => cell === REST)) {
        return chamber.length - 1 - i;
      }
    }
    return 0;
  }

  checkIfPlayerLost(
    chamber: Chamber,
    shapeHeight: number,
    chamberHeight: number
  ): boolean {
    const towerHeight = this.getTowerHeight(chamber);
    const totalHeight = towerHeight + shapeHeight;
    return totalHeight >= chamberHeight - 1;
  }

  initializeChamber(): Chamber {
    const chamber: Chamber = Array.from({
      length: MAX_CHAMBER_HEIGHT - 1,
    }).map(() => {
      return Array.from({ length: NUM_OF_COLS }).map((_, colIdx: number) => {
        const isLeftSide = colIdx === 0;
        const isRightSide = colIdx === NUM_OF_COLS - 1;
        if (isLeftSide || isRightSide) return SIDE_WALL;
        return EMPTY;
      });
    });

    const floorRow = Array.from({ length: NUM_OF_COLS }).map(() => FLOOR);
    chamber.push(floorRow);

    const shapeIdx = Math.floor(Math.random() * this.shapes.size);
    const shape = this.shapes.get(shapeIdx)!;
    chamber.splice(0, shape.length);
    chamber.unshift(...shape);

    return chamber;
  }
}
