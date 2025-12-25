import type { Shape } from "src/types";
import { LIVE } from "src/constants/constants";

const cross: Shape = [
  [".", LIVE, "."],
  [LIVE, LIVE, LIVE],
  [".", LIVE, "."],
];

export default cross;
