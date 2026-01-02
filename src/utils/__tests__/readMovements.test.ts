import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readMovements } from "../readMovements";
import readFile from "../readFile";

vi.mock("../readFile");

describe("readMovements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses movement characters correctly", async () => {
    const mockReadFile = vi.mocked(readFile);
    mockReadFile.mockResolvedValue("<>rd");

    const result = await readMovements();

    expect(result).toEqual(["<", ">", "rotate", "down"]);
  });

  it("ignores unknown characters", async () => {
    const mockReadFile = vi.mocked(readFile);
    mockReadFile.mockResolvedValue("<x>y r");

    const result = await readMovements();

    expect(result).toEqual(["<", ">", "rotate"]);
  });

  it("handles empty string", async () => {
    const mockReadFile = vi.mocked(readFile);
    mockReadFile.mockResolvedValue("");

    const result = await readMovements();

    expect(result).toEqual([]);
  });

  it("returns default movements on read error", async () => {
    const mockReadFile = vi.mocked(readFile);
    mockReadFile.mockRejectedValue(new Error("File not found"));

    const result = await readMovements();

    expect(result).toEqual(["<", ">", "rotate", "<", ">", "rotate", "down"]);
  });
});
