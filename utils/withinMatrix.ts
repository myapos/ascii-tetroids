const withinMatrix = (input: string[][], pos: number[]) =>
  pos[0] >= 0 &&
  pos[0] < input.length &&
  pos[1] >= 0 &&
  pos[1] < input[0].length;

export default withinMatrix;
