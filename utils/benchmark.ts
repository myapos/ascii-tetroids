const benchmark = async (puzzleDay: string, cb: () => Promise<unknown>) => {
  const start = performance.now();
  const res = await cb();
  const end = performance.now();
  console.log(
    `${puzzleDay} took ${(end - start).toFixed(2)} ms, result: ${res} `
  );
  return res;
};

export default benchmark;
