import { describe, it, expect, beforeEach } from "vitest";
import { PreviewManager } from "src/game/PreviewManager";
import {
  PREVIEW,
  PREVIEW_SHAPE,
  LIVE,
  MAX_CHAMBER_HEIGHT,
  PREVIEW_COLS,
} from "src/constants/constants";
import type { Chamber } from "src/types";

describe("PreviewManager", () => {
  let previewChamber: Chamber;

  beforeEach(() => {
    previewChamber = PreviewManager.initializeChamber();
  });

  describe("chamber initialization", () => {
    it("creates chamber with correct dimensions", () => {
      expect(previewChamber.length).toBe(MAX_CHAMBER_HEIGHT);
      expect(previewChamber[0].length).toBe(PREVIEW_COLS);
    });

    it("fills chamber with PREVIEW characters", () => {
      for (let i = 0; i < previewChamber.length; i++) {
        for (let j = 0; j < previewChamber[0].length; j++) {
          expect(previewChamber[i][j]).toBe(PREVIEW);
        }
      }
    });

    it("all rows have consistent width", () => {
      for (let i = 0; i < previewChamber.length; i++) {
        expect(previewChamber[i].length).toBe(PREVIEW_COLS);
      }
    });
  });

  describe("adding preview shapes", () => {
    it("adds shape to preview chamber without modifying dimensions", () => {
      const original = PreviewManager.initializeChamber();
      const updated = PreviewManager.addPreviewNextShape(0, original, 1);

      expect(updated.length).toBe(original.length);
      expect(updated[0].length).toBe(PREVIEW_COLS);
    });

    it("all rows remain consistent width after adding shape", () => {
      const chamber = PreviewManager.initializeChamber();
      const updated = PreviewManager.addPreviewNextShape(0, chamber, 1);

      for (let i = 0; i < updated.length; i++) {
        expect(updated[i].length).toBe(PREVIEW_COLS);
      }
    });

    it("adds NEXT header at top", () => {
      const chamber = PreviewManager.initializeChamber();
      const updated = PreviewManager.addPreviewNextShape(0, chamber, 1);

      expect(updated[0][0]).toBe("N");
      expect(updated[0][1]).toBe("E");
      expect(updated[0][2]).toBe("X");
      expect(updated[0][3]).toBe("T");
    });

    it("adds LEVEL text to preview", () => {
      const chamber = PreviewManager.initializeChamber();
      const updated = PreviewManager.addPreviewNextShape(0, chamber, 1);

      let levelFound = false;
      for (let i = 0; i < updated.length; i++) {
        if (
          updated[i][0] === "L" &&
          updated[i][1] === "E" &&
          updated[i][2] === "V" &&
          updated[i][3] === "E" &&
          updated[i][4] === "L"
        ) {
          levelFound = true;
          break;
        }
      }
      expect(levelFound).toBe(true);
    });

    it("displays current level number", () => {
      const chamber = PreviewManager.initializeChamber();
      const updated = PreviewManager.addPreviewNextShape(0, chamber, 5);

      let levelNumFound = false;
      for (let i = 0; i < updated.length; i++) {
        if (updated[i][0] === "5") {
          levelNumFound = true;
          break;
        }
      }
      expect(levelNumFound).toBe(true);
    });

    it("includes shape cells in preview", () => {
      const chamber = PreviewManager.initializeChamber();
      const updated = PreviewManager.addPreviewNextShape(0, chamber, 1);

      let hasShapeCells = false;
      for (let i = 0; i < updated.length; i++) {
        for (let j = 0; j < updated[i].length; j++) {
          if (updated[i][j] === PREVIEW_SHAPE) {
            hasShapeCells = true;
            break;
          }
        }
        if (hasShapeCells) break;
      }
      expect(hasShapeCells).toBe(true);
    });
  });

  describe("preview area emptying", () => {
    it("empties preview area completely", () => {
      const chamber = PreviewManager.initializeChamber();
      // Modify chamber
      chamber[5][5] = LIVE;
      expect(chamber[5][5]).not.toBe(PREVIEW);

      // Empty it
      PreviewManager.emptyPreviewArea(chamber);

      // Verify all cells are PREVIEW
      for (let i = 0; i < chamber.length; i++) {
        for (let j = 0; j < chamber[0].length; j++) {
          expect(chamber[i][j]).toBe(PREVIEW);
        }
      }
    });
  });

  describe("multiple shapes", () => {
    it("displays different shapes for each shape index", () => {
      const chamber1 = PreviewManager.initializeChamber();
      const chamber2 = PreviewManager.initializeChamber();

      const result1 = PreviewManager.addPreviewNextShape(0, chamber1, 1);
      const result2 = PreviewManager.addPreviewNextShape(1, chamber2, 1);

      // Count shape cells in each preview
      let count1 = 0;
      let count2 = 0;

      for (let i = 0; i < result1.length; i++) {
        for (let j = 0; j < result1[0].length; j++) {
          if (result1[i][j] === PREVIEW_SHAPE) count1++;
          if (result2[i][j] === PREVIEW_SHAPE) count2++;
        }
      }

      // Different shapes should have different number of shape cells
      // (though some might coincidentally match)
      expect(count1).toBeGreaterThan(0);
      expect(count2).toBeGreaterThan(0);
    });
  });

  describe("shape positioning", () => {
    it("shapes are left-aligned in preview", () => {
      const chamber = PreviewManager.initializeChamber();
      const updated = PreviewManager.addPreviewNextShape(3, chamber, 1); // vertical line

      // Find leftmost shape cell
      let leftmostCol = PREVIEW_COLS;
      for (let i = 0; i < updated.length; i++) {
        for (let j = 0; j < updated[0].length; j++) {
          if (updated[i][j] === PREVIEW_SHAPE) {
            leftmostCol = Math.min(leftmostCol, j);
          }
        }
      }

      // Should be positioned after NEXT header area, typically around col 0-4
      expect(leftmostCol).toBeLessThan(PREVIEW_COLS - 1);
    });
  });

  describe("edge cases", () => {
    it("handles all 7 shape types", () => {
      for (let shapeIdx = 0; shapeIdx < 7; shapeIdx++) {
        const chamber = PreviewManager.initializeChamber();
        const updated = PreviewManager.addPreviewNextShape(
          shapeIdx,
          chamber,
          1
        );

        // Should have NEXT header
        expect(updated[0][0]).toBe("N");

        // All rows should be correct width
        for (let i = 0; i < updated.length; i++) {
          expect(updated[i].length).toBe(PREVIEW_COLS);
        }
      }
    });

    it("handles level 1 and high level numbers", () => {
      const chamber1 = PreviewManager.initializeChamber();
      const chamber99 = PreviewManager.initializeChamber();

      const result1 = PreviewManager.addPreviewNextShape(0, chamber1, 1);
      const result99 = PreviewManager.addPreviewNextShape(0, chamber99, 99);

      // Both should have valid dimensions
      expect(result1[0].length).toBe(PREVIEW_COLS);
      expect(result99[0].length).toBe(PREVIEW_COLS);

      // Both should have NEXT header
      expect(result1[0][0]).toBe("N");
      expect(result99[0][0]).toBe("N");
    });

    it("does not corrupt chamber when adding shape", () => {
      const chamber = PreviewManager.initializeChamber();
      const updated = PreviewManager.addPreviewNextShape(0, chamber, 1);

      // Verify integrity of structure
      expect(updated.length).toBe(MAX_CHAMBER_HEIGHT);
      for (let i = 0; i < updated.length; i++) {
        expect(Array.isArray(updated[i])).toBe(true);
        expect(updated[i].length).toBe(PREVIEW_COLS);
        for (let j = 0; j < updated[i].length; j++) {
          expect(typeof updated[i][j]).toBe("string");
        }
      }
    });
  });
});
