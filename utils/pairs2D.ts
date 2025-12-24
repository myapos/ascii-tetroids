const pairs2D = <T>(list: T[]): [T, T][] => {
  const result: [T, T][] = [];

  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const itemA = list[i];
      const itemB = list[j];
      result.push([itemA, itemB]);
    }
  }

  return result;
};

export default pairs2D;
