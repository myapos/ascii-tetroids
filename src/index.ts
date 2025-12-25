import mainEngine from "./mainEngine";

const main = async () => {
  const result = await mainEngine();
  console.log("Result:", result);
};

main();
