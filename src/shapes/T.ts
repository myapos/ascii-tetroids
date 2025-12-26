import type { Shape } from "src/types";
import { LIVE } from "src/constants/constants";

const T: Shape = [
  [".", ".", "."],
  [LIVE, LIVE, LIVE],
  [".", LIVE, "."],
];

export default T;
