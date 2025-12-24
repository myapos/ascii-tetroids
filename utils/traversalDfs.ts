import rotateDirection from "utils/rotateDirection";
export type Direction = "^" | ">" | "v" | "<";
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

export const dfs = function (
  matrix: string[][],
  row: number,
  col: number,
  seen: boolean[][],
  values: string[],
  curDir: Direction,
  curShift: { rowShift: number; colShift: number },
  prevRow: number,
  prevCol: number,
  counter: number
): number {
  if (row < 0 || col < 0 || row >= matrix.length || col >= matrix[0].length)
    return counter;

  let countPositions = counter;
  if (matrix[row][col] !== "#") {
    seen[row][col] = true;
    matrix[row][col] !== "X" && countPositions++;
    matrix[row][col] = "X";
    values.push(matrix[row][col]);
  }

  let newCurDir: Direction = curDir;
  let newCurShift = curShift;

  let activeRow = row;
  let activeCol = col;
  if (matrix[row][col] === "#") {
    newCurDir = rotateDirection(curDir);
    newCurShift = directionsMap[newCurDir];
    activeRow = prevRow;
    activeCol = prevCol;
  }

  return dfs(
    matrix,
    activeRow + newCurShift.rowShift,
    activeCol + newCurShift.colShift,
    seen,
    values,
    newCurDir,
    newCurShift,
    activeRow,
    activeCol,
    countPositions
  );
};

const traversalDFS = function (
  matrix: string[][],
  start: number[],
  counter: number
): number {
  const seen = new Array(matrix.length)
    .fill(0)
    .map(() => new Array(matrix[0].length).fill(false));

  const values: string[] = [];
  const curDir = matrix[start[0]][start[1]] as Direction;
  const curShift = directionsMap[curDir];

  const countPositions = dfs(
    matrix,
    start[0],
    start[1],
    seen,
    values,
    curDir,
    curShift,
    start[0],
    start[1],
    counter
  );

  return countPositions;
};

export default traversalDFS;
