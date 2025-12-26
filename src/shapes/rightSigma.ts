import type { Shape } from "src/types";
import { LIVE } from "src/constants/constants";

const rightSigma: Shape = [
  [".", LIVE, LIVE],
  [LIVE, LIVE, "."],
];

export default rightSigma;
