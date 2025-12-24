const pickTheorem = (area: number, edges: number): number => {
  // A = i + b/2 - 1
  // i = A - b/2 + 1
  return area - edges / 2 + 1;
};

export default pickTheorem;
