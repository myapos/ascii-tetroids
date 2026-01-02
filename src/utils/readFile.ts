import fs from "node:fs/promises";

const readFile = async (
  path: string,
  mode: string = "array", // "string" | "array" | "2d"
  sep2d: string = "" // optional separator for 2d mode
): Promise<string[][] | string[] | string> => {
  let fileData: string = "";
  try {
    fileData = await fs.readFile(path, "utf-8");
  } catch (error) {
    console.error("Error reading file:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }

  if (fileData.length === 0) {
    return [];
  }

  if (mode === "array") {
    return fileData.trim().split("\n");
  }

  if (mode === "2d") {
    return fileData
      .trim()
      .split("\n")
      .map((line) => line.split(sep2d));
  }

  return fileData;
};

export default readFile;
