const maskPattern = (pattern: string[][]): string[][] => {
  const copyPattern = pattern
    .map((pat) => pat)
    .map((pat, i) => {
      return pat.map((char, j) => {
        if (
          (i === 0 && j === 1) ||
          (i === 1 && j === 0) ||
          (i === 1 && j === 2) ||
          (i === 2 && j === 1)
        ) {
          return "#";
        }

        return char;
      });
    });
  return copyPattern;
};

export default maskPattern;
