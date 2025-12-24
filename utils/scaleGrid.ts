function scale(grid: string[][], n: number): string[][] {
  return grid.flatMap((row) =>
    Array(n).fill(row.flatMap((cell) => Array(n).fill(cell)))
  );
}

export default scale;
