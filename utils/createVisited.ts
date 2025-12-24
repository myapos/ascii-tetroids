const visitedAr = (mapAr: string | number[][]) => {
  const visited: boolean[][] = [];
  for (let i = 0; i < mapAr.length; i++) {
    visited.push(new Array(mapAr[i].length).fill(false));
  }

  return visited;
};

export default visitedAr;
