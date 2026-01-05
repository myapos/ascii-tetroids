import type { Shape } from "src/types";
import { LIVE, EMPTY } from "src/constants/constants";

const leftSigma: Shape = [
  [LIVE, LIVE, EMPTY],
  [EMPTY, LIVE, LIVE],
];

export default leftSigma;
