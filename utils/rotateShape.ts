const EMPTY = ".";

const rotateShape = (shape: string[][], empty: string = EMPTY): string[][] => {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: string[][] = Array.from({ length: cols }, () =>
    Array.from({ length: rows }, () => EMPTY)
  );

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = shape[r][c];
    }
  }
  return rotated;
};

export default rotateShape;
