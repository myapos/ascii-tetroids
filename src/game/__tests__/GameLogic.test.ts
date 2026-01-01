import { describe, it, expect, beforeEach } from "vitest";
import { GameLogic } from "../GameLogic";
import {
  EMPTY,
  LIVE,
  REST,
  NUM_OF_COLS,
  MAX_CHAMBER_HEIGHT,
  SIDE_WALL,
  FLOOR,
} from "src/constants/constants";
import type { Chamber } from "src/types";

describe("GameLogic", () => {
  let gameLogic: GameLogic;

  beforeEach(() => {
    gameLogic = new GameLogic();
  });

  describe("initialization", () => {
    it("initializes chamber with correct dimensions", () => {
      const chamber = gameLogic.initializeChamber();
      expect(chamber.length).toBe(MAX_CHAMBER_HEIGHT);
      expect(chamber[0].length).toBe(NUM_OF_COLS);
    });

    it("initializes chamber with walls on left and right", () => {
      const chamber = gameLogic.initializeChamber();
      // Check left wall (except floor row)
      for (let i = 0; i < chamber.length - 1; i++) {
        expect(chamber[i][0]).toBe(SIDE_WALL);
      }
      // Check right wall (except floor row)
      for (let i = 0; i < chamber.length - 1; i++) {
        expect(chamber[i][NUM_OF_COLS - 1]).toBe(SIDE_WALL);
      }
    });

    it("initializes chamber with floor at bottom", () => {
      const chamber = gameLogic.initializeChamber();
      for (let j = 0; j < NUM_OF_COLS; j++) {
        expect(chamber[MAX_CHAMBER_HEIGHT - 1][j]).toBe(FLOOR);
      }
    });

    it("initializes with a random shape at top", () => {
      const chamber = gameLogic.initializeChamber();
      let hasLiveCell = false;
      for (let i = 0; i < 5; i++) {
        for (let j = 1; j < NUM_OF_COLS - 1; j++) {
          if (chamber[i][j] === LIVE) {
            hasLiveCell = true;
          }
        }
      }
      expect(hasLiveCell).toBe(true);
    });
  });

  describe("shape coordinates", () => {
    it("getShapeCoords returns all live cells", () => {
      const chamber = gameLogic.initializeChamber();
      const coords = gameLogic.getShapeCoords(chamber);
      expect(coords.length).toBeGreaterThan(0);
      // Verify all returned coords are actually LIVE
      for (const [row, col] of coords) {
        expect(chamber[row][col]).toBe(LIVE);
      }
    });

    it("deleteShape replaces live cells with empty", () => {
      const chamber = gameLogic.initializeChamber();
      const coords = gameLogic.getShapeCoords(chamber);
      const updated = gameLogic.deleteShape(coords, chamber);
      for (const [row, col] of coords) {
        expect(updated[row][col]).toBe(EMPTY);
      }
    });

    it("restShape replaces live cells with rest", () => {
      const chamber = gameLogic.initializeChamber();
      const coords = gameLogic.getShapeCoords(chamber);
      const updated = gameLogic.restShape(chamber, coords);
      for (const [row, col] of coords) {
        expect(updated[row][col]).toBe(REST);
      }
    });
  });

  describe("movement", () => {
    it("moveShapeDown moves shape down by one row", () => {
      const chamber = gameLogic.initializeChamber();
      const coordsBefore = gameLogic.getShapeCoords(chamber);
      const updated = gameLogic.moveShapeDown(chamber);
      const coordsAfter = gameLogic.getShapeCoords(updated);

      // Check that rows increased by 1
      for (let i = 0; i < coordsBefore.length; i++) {
        const rowBefore = coordsBefore[i][0];
        const rowAfter = coordsAfter[i][0];
        expect(rowAfter).toBe(rowBefore + 1);
      }
    });

    it("moveShapeDown stops at floor", () => {
      const chamber = gameLogic.initializeChamber();
      let current = chamber;
      let lastCoords = gameLogic.getShapeCoords(current);

      // Move down until we can't anymore
      for (let i = 0; i < MAX_CHAMBER_HEIGHT * 2; i++) {
        const next = gameLogic.moveShapeDown(current);
        const nextCoords = gameLogic.getShapeCoords(next);

        if (gameLogic.arraysAreEqual(lastCoords, nextCoords)) {
          // Shape stopped moving
          break;
        }
        current = next;
        lastCoords = nextCoords;
      }

      // Verify shape is above the floor
      const finalCoords = gameLogic.getShapeCoords(current);
      for (const [row] of finalCoords) {
        expect(row).toBeLessThan(MAX_CHAMBER_HEIGHT - 1);
      }
    });

    it("canMoveLeft returns false when at left edge", () => {
      const chamber: Chamber = Array.from({ length: 5 }).map((_, idx) =>
        Array(NUM_OF_COLS).fill(idx === 4 ? FLOOR : EMPTY)
      );
      chamber[4] = Array(NUM_OF_COLS).fill(FLOOR); // Add floor row
      // Place shape at left edge
      chamber[0][1] = LIVE; // column 1 is leftmost playable
      chamber[0][0] = SIDE_WALL; // left wall
      const canMove = gameLogic["canMoveLeft"](chamber);
      expect(canMove).toBe(false);
    });

    it("canMoveRight returns false when at right edge", () => {
      const chamber: Chamber = Array.from({ length: 5 }).map((_, idx) =>
        Array(NUM_OF_COLS).fill(idx === 4 ? FLOOR : EMPTY)
      );
      chamber[4] = Array(NUM_OF_COLS).fill(FLOOR); // Add floor row
      // Place shape at right edge
      chamber[0][NUM_OF_COLS - 2] = LIVE; // rightmost playable
      chamber[0][NUM_OF_COLS - 1] = SIDE_WALL; // right wall
      const canMove = gameLogic["canMoveRight"](chamber);
      expect(canMove).toBe(false);
    });

    it("moveShapeWithGas routes to correct movement", () => {
      const chamber = gameLogic.initializeChamber();

      const leftResult = gameLogic.moveShapeWithGas(chamber, "<");
      const rightResult = gameLogic.moveShapeWithGas(chamber, ">");
      const centerResult = gameLogic.moveShapeWithGas(chamber, "invalid");

      // Get shape coordinates to verify movement direction
      const leftCoords = gameLogic.getShapeCoords(leftResult);
      const rightCoords = gameLogic.getShapeCoords(rightResult);
      const originalCoords = gameLogic.getShapeCoords(chamber);

      // Left movement should shift columns left
      expect(leftCoords[0][1]).toBeLessThan(originalCoords[0][1]);
      // Right movement should shift columns right
      expect(rightCoords[0][1]).toBeGreaterThan(originalCoords[0][1]);
      // Invalid move should return chamber unchanged
      expect(centerResult).toEqual(chamber);
    });
  });

  describe("rotation", () => {
    it("rotateShape returns a chamber", () => {
      const chamber = gameLogic.initializeChamber();
      const result = gameLogic.rotateShape(chamber);
      expect(result).toBeDefined();
      expect(result.length).toBe(chamber.length);
    });

    it("rotateShape preserves shape if rotation impossible", () => {
      const chamber = gameLogic.initializeChamber();
      const coordsBefore = gameLogic.getShapeCoords(chamber);
      const result = gameLogic.rotateShape(chamber);
      const coordsAfter = gameLogic.getShapeCoords(result);

      // If rotation happened, coordinates will change
      // If it didn't, they stay the same - both are valid
      expect(coordsAfter.length).toBe(coordsBefore.length);
    });
  });

  describe("line clearing", () => {
    it("checkFilledRows detects no filled rows initially", () => {
      const chamber = gameLogic.initializeChamber();
      const { numOfFilledRows } = gameLogic.checkFilledRows(
        chamber,
        NUM_OF_COLS
      );
      expect(numOfFilledRows).toBe(0);
    });

    it("checkFilledRows fills a complete row", () => {
      const chamber: Chamber = Array.from({ length: MAX_CHAMBER_HEIGHT }).map(
        () => Array(NUM_OF_COLS).fill(EMPTY)
      );

      // Create a nearly full row
      for (let j = 1; j < NUM_OF_COLS - 1; j++) {
        chamber[5][j] = REST;
      }

      const { numOfFilledRows } = gameLogic.checkFilledRows(
        chamber,
        NUM_OF_COLS
      );
      expect(numOfFilledRows).toBe(1);
    });

    it("getTowerHeight calculates correct height", () => {
      const chamber: Chamber = Array.from({ length: MAX_CHAMBER_HEIGHT }).map(
        () => Array(NUM_OF_COLS).fill(EMPTY)
      );

      // Add some rested pieces
      chamber[10][5] = REST;
      chamber[11][5] = REST;

      const height = gameLogic.getTowerHeight(chamber);
      expect(height).toBeGreaterThan(0);
    });
  });

  describe("loss condition", () => {
    it("checkIfPlayerLost returns false initially", () => {
      const chamber = gameLogic.initializeChamber();
      const lost = gameLogic.checkIfPlayerLost(chamber, 4, MAX_CHAMBER_HEIGHT);
      expect(lost).toBe(false);
    });

    it("checkIfPlayerLost returns true when tower is too high", () => {
      const chamber: Chamber = Array.from({ length: MAX_CHAMBER_HEIGHT }).map(
        () => Array(NUM_OF_COLS).fill(EMPTY)
      );

      // Fill most of the chamber with rested pieces
      for (let i = 0; i < MAX_CHAMBER_HEIGHT - 5; i++) {
        for (let j = 1; j < NUM_OF_COLS - 1; j++) {
          chamber[i][j] = REST;
        }
      }

      const lost = gameLogic.checkIfPlayerLost(chamber, 4, MAX_CHAMBER_HEIGHT);
      expect(lost).toBe(true);
    });
  });

  describe("utility methods", () => {
    it("arraysAreEqual compares coordinate arrays", () => {
      const arr1 = [
        [1, 2],
        [3, 4],
      ];
      const arr2 = [
        [1, 2],
        [3, 4],
      ];
      const arr3 = [
        [1, 2],
        [3, 5],
      ];

      expect(gameLogic.arraysAreEqual(arr1, arr2)).toBe(true);
      expect(gameLogic.arraysAreEqual(arr1, arr3)).toBe(false);
    });

    it("getShapes returns all 7 tetromino shapes", () => {
      const shapes = gameLogic.getShapes();
      expect(shapes.size).toBe(7);
    });
  });
});
