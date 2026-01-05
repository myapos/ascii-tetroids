import type { Shape } from "src/types";
import { LIVE, EMPTY } from "src/constants/constants";

const T: Shape = [
  [EMPTY, EMPTY, EMPTY],
  [LIVE, LIVE, LIVE],
  [EMPTY, LIVE, EMPTY],
];

export default T;
