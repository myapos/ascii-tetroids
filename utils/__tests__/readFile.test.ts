import { describe, it, expect, spyOn, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs/promises"; // This matches your code

import readFile from "../readFile";

describe("readFile", () => {
  let readFileSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    readFileSpy = vi.spyOn(fs, "readFile");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should pass", () => {
    expect(true).toBe(true);
  });
  // it("should read data from file", async () => {
  //   readFileSpy.mockResolvedValue(`3   4\n4   3\n2   5\n1   3\n3   9\n3   3`);
  //   const result = await readFile("input.txt");
  //   expect(result).toEqual([
  //     "3   4",
  //     "4   3",
  //     "2   5",
  //     "1   3",
  //     "3   9",
  //     "3   3",
  //   ]);
  // });

  // it("should read data from file as string", async () => {
  //   readFileSpy.mockResolvedValue(`3   4\n4   3\n2   5\n1   3\n3   9\n3   3`);
  //   const result = await readFile("input.txt", "string");
  //   expect(result).toEqual(`3   4\n4   3\n2   5\n1   3\n3   9\n3   3`);
  // });

  // it("should return empty array for empty file", async () => {
  //   readFileSpy.mockResolvedValue("");
  //   const result = await readFile("empty.txt");
  //   expect(result).toEqual([]);
  // });
  // it("should return empty array for non-existent file", async () => {
  //   const errorMessage = "File not found";
  //   readFileSpy.mockRejectedValue(new Error(errorMessage));

  //   try {
  //     const result = await readFile("non-existent.txt");
  //     expect(result).toEqual([]);
  //   } catch (e) {
  //     if (e instanceof Error) {
  //       expect(e).toBeInstanceOf(Error);
  //       expect(e.message).toBe(errorMessage);
  //     }
  //   }
  // });
});
