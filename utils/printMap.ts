const printMap = (
  map: (string | boolean | number)[][] | (string | boolean | number)[],
  mode: string = "2d"
) => {
  if (mode === "2d") {
    map.forEach((line) => {
      if (Array.isArray(line)) {
        console.log(line.join("") + "\n");
      } else {
        console.log(line);
      }
    });
    return;
  }

  if (mode === "1d") {
    map.forEach((line) => {
      console.log(line);
    });
    return;
  }
};

export default printMap;
