import rotateDirection from "utils/rotateDirection";
import directionsMap from "2024/constants/directionsMap.ts";
import type { Direction } from "utils/types.ts";

type Mark = "|" | "+" | "-";
const getMark = (newDir: Direction, prevDir: Direction): Mark | undefined => {
  const isUpAndRight =
    (prevDir as Direction) === "^" && (newDir as Direction) === ">";
  const isRightAndDown =
    (prevDir as Direction) === ">" && (newDir as Direction) === "v";
  const isDownAndLeft =
    (prevDir as Direction) === "v" && (newDir as Direction) === "<";
  const isLeftAndUp =
    (prevDir as Direction) === "<" && (newDir as Direction) === "^";

  const isTurning =
    isUpAndRight || isRightAndDown || isDownAndLeft || isLeftAndUp;

  if (isTurning) {
    return "+";
  }

  if (newDir === "^" || newDir === "v") {
    return "|";
  }

  if (newDir === ">" || newDir === "<") {
    return "-";
  }

  return undefined;
};

const obstacles = ["#", "O"];

export const dfs = function (
  matrix: string[][],
  row: number,
  col: number,
  seen: Set<string>, // Use Set to track unique (position + direction)
  values: string[],
  curDir: Direction,
  prevDir: Direction,
  curShift: { rowShift: number; colShift: number },
  prevRow: number,
  prevCol: number,
  startRow: number,
  startCol: number,
  rowO: number,
  colO: number
): boolean {
  if (row < 0 || col < 0 || row >= matrix.length || col >= matrix[0].length) {
    return false;
  }

  // Create a unique key combining position and direction
  const stateKey = `${row},${col},${curDir}`;

  // If we visit the same state again, it's a loop
  if (seen.has(stateKey) && seen.has(`${rowO},${colO},${curDir}`)) {
    return true;
  }

  // Mark this state as visited ignore start position
  if (stateKey !== `${startRow},${startCol}`) {
    seen.add(stateKey);
  }

  let mark: Mark | undefined = undefined;

  // Mark the current position with the appropriate mark
  if (
    matrix[row][col] !== "#" &&
    matrix[row][col] !== "O" &&
    matrix[row][col] !== "^"
  ) {
    values.push(matrix[row][col]);
    mark = getMark(curDir, curDir);
    mark ? (matrix[row][col] = mark) : null;
  }

  let newCurDir: Direction = curDir;
  let savePrevDir: Direction = prevDir;
  let newCurShift = curShift;

  let activeRow = row;
  let activeCol = col;

  // If we hit an obstacle, we need to rotate the guard
  if (obstacles.includes(matrix[row][col])) {
    newCurDir = rotateDirection(curDir);
    newCurShift = directionsMap[newCurDir];
    mark = getMark(newCurDir, curDir);
    activeRow = prevRow;
    activeCol = prevCol;
    mark ? (matrix[activeRow][activeCol] = mark) : null;
  }

  // Continue DFS to the next position
  return dfs(
    matrix,
    activeRow + newCurShift.rowShift,
    activeCol + newCurShift.colShift,
    seen,
    values,
    newCurDir,
    savePrevDir,
    newCurShift,
    activeRow,
    activeCol,
    startRow,
    startCol,
    rowO,
    colO
  );
};

const detectObstaclePositions = (
  matrix: string[][],
  start: number[],
  counter: number
): number => {
  let loopCount = 0;
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      // Avoid placing obstacle at the start position
      if (i === start[0] && j === start[1]) {
        continue;
      }

      const values: string[] = [];
      const curDir = matrix[start[0]][start[1]] as Direction;
      const curShift = directionsMap[curDir];

      const seen = new Set<string>(); // Using Set to store visited states

      const tempMatrix = matrix.map((row) => [...row]); // Clone matrix.
      tempMatrix[i][j] = "O"; // Place obstacle.

      // Ensure the guard meets the obstacle first
      if (
        dfs(
          tempMatrix,
          start[0],
          start[1],
          seen,
          values,
          curDir,
          curDir,
          curShift,
          start[0],
          start[1],
          start[0],
          start[1],
          i,
          j
        )
      ) {
        loopCount++;
      }
    }
  }

  return loopCount;
};

export default detectObstaclePositions;
