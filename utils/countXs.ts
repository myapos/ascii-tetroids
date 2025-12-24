const countXs = (grid: string[][], mark = "X"): number => {
  let count = 0;
  for (let row of grid) {
    for (let cell of row) {
      if (cell === mark) {
        count++;
      }
    }
  }
  return count;
};

export default countXs;
