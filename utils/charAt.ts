import withinMatrix from "./withinMatrix";
const charAt = (input: string[][], pos: number[]): string =>
  withinMatrix(input, pos) ? input[pos[0]][pos[1]] : "";

export default charAt;
