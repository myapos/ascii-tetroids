import type { Chamber } from "src/types";

const clone = (chamber: Chamber): Chamber => chamber.map((row) => [...row]);
export default clone;
