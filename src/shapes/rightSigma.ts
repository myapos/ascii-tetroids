import type { Shape } from "src/types";
import { LIVE, EMPTY } from "src/constants/constants";

const rightSigma: Shape = [
  [EMPTY, LIVE, LIVE],
  [LIVE, LIVE, EMPTY],
];

export default rightSigma;
