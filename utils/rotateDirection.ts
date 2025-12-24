import type { Direction } from "utils/types.ts";

const rotateDirection = (curDir: Direction): Direction => {
  if (curDir === "^") {
    return ">";
  }
  if (curDir === "v") {
    return "<";
  }
  if (curDir === ">") {
    return "v";
  }
  if (curDir === "<") {
    return "^";
  }

  return "^";
};

export default rotateDirection;
