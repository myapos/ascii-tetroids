const swap = (arr: number[], i: number, j: number) => {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
};

export const swapSimple = <T>(ar1: T, ar2: T) => {
  const temp = ar1;
  ar1 = ar2;
  ar2 = temp;
};

export default swap;
