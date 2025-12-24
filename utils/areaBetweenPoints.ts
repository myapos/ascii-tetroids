import type { Pos } from "utils/types";

const areaBetweenPoints = (point1: Pos, point2: Pos): number => {
  const width = Math.abs(point2.x - point1.x) + 1;
  const height = Math.abs(point2.y - point1.y) + 1;
  return width * height;
};
export default areaBetweenPoints;
