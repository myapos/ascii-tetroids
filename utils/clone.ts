import type { Chamber } from "src/types";

const clone = (chamber: Chamber): Chamber => chamber.map((row) => [...row]);

export const cloneMap = <K, T>(map: Map<K, T>): Map<K, T> =>
  new Map(JSON.parse(JSON.stringify([...map])));
export default clone;
