const flipShape = (shape: string[][]): string[][] => {
  return shape.map((row) => [...row].reverse());
};

export default flipShape;
