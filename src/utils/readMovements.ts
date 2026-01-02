import readFile from "utils/readFile";
import { join } from "path";
import { fileURLToPath } from "url";
import type { UserMove } from "src/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");

export async function readMovements(): Promise<UserMove[]> {
  try {
    const filePath = join(__dirname, "../inputSample.txt");
    const content = await readFile(filePath, "string");

    const movements: UserMove[] = [];

    for (const char of content) {
      switch (char) {
        case "<":
          movements.push("<");
          break;
        case ">":
          movements.push(">");
          break;
        case "r":
          movements.push("rotate");
          break;
        case "d":
          movements.push("down");
          break;
        // Ignore any other characters
      }
    }

    return movements;
  } catch (error: unknown) {
    console.error(
      "Failed to read movements from inputSample.txt, using defaults",
      error
    );
    // Fallback to default movements
    return ["<", ">", "rotate", "<", ">", "rotate", "down"];
  }
}
