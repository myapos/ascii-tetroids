type Point = { x: number; y: number };

const shoelaceFormula = (points: Point[]): number => {
  // https://en.wikipedia.org/wiki/Shoelace_formula
  // find pairs of i , i + 1 points and apply shoelace formula
  let sum = 0;

  // console.log("points", points);
  const pairs: Point[][] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const point1 = points[i];
    const point2 = points[i + 1];

    sum += point1.x * point2.y - point2.x * point1.y;
  }

  return Math.abs(sum / 2);
};

export default shoelaceFormula;
