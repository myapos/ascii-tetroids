import type { Pos } from "./types";

const manhattanDistance = (pos1: Pos, pos2: Pos): number => {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
};

export default manhattanDistance;
