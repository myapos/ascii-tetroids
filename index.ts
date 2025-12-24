import puzzle1 from "./src/puzzle1";

const main = async () => {
  const result = await puzzle1("./src/input.txt");
  console.log("Result:", result);
};

main();
