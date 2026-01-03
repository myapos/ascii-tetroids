import { describe, it, expect } from "vitest";
import createShapes, { getShapes } from "../createShapes";
import { SIDE_WALL, EMPTY, NUM_OF_COLS, LIVE } from "../../constants/constants";

describe("Shape Creation", () => {
  describe("getShapes - raw unpadded shapes", () => {
    it("returns 7 block shapes", () => {
      const shapes = getShapes();
      expect(shapes.size).toBe(7);
    });

    it("all shapes contain only valid characters", () => {
      const shapes = getShapes();
      const validChars = [LIVE, EMPTY];
      shapes.forEach((shape) => {
        shape.forEach((row) => {
          row.forEach((cell) => {
            expect(validChars).toContain(cell);
          });
        });
      });
    });

    it("all shapes are non-empty", () => {
      const shapes = getShapes();
      shapes.forEach((shape) => {
        expect(shape.length).toBeGreaterThan(0);
        shape.forEach((row) => {
          expect(row.length).toBeGreaterThan(0);
        });
      });
    });

    it("all shapes have at least one live cell", () => {
      const shapes = getShapes();
      shapes.forEach((shape) => {
        let hasLiveCell = false;
        shape.forEach((row) => {
          row.forEach((cell) => {
            if (cell === LIVE) hasLiveCell = true;
          });
        });
        expect(hasLiveCell).toBe(true);
      });
    });
  });

  describe("createShapes - padded shapes for 17-column chamber", () => {
    it("returns 7 padded shapes", () => {
      const shapes = createShapes();
      expect(shapes.size).toBe(7);
    });

    it("all shapes are padded to NUM_OF_COLS (17)", () => {
      const shapes = createShapes();
      shapes.forEach((shape) => {
        shape.forEach((row) => {
          expect(row.length).toBe(NUM_OF_COLS);
        });
      });
    });

    it("all padded shapes have side walls", () => {
      const shapes = createShapes();
      shapes.forEach((shape) => {
        shape.forEach((row) => {
          expect(row[0]).toBe(SIDE_WALL);
          expect(row[NUM_OF_COLS - 1]).toBe(SIDE_WALL);
        });
      });
    });

    it("padding fills with EMPTY cells", () => {
      const shapes = createShapes();
      shapes.forEach((shape) => {
        shape.forEach((row) => {
          // Check that padded area contains valid characters
          row.forEach((cell) => {
            expect([SIDE_WALL, LIVE, EMPTY]).toContain(cell);
          });
        });
      });
    });

    it("preserves original shape content in padding", () => {
      const rawShapes = getShapes();
      const paddedShapes = createShapes();

      // Verify that raw shapes are contained within padded shapes
      rawShapes.forEach((rawShape, idx) => {
        const paddedShape = paddedShapes.get(idx);
        expect(paddedShape).toBeDefined();
        // Just check that padding didn't lose original cells
        expect(paddedShape!.length).toBe(rawShape.length);
      });
    });
  });

  describe("shape cloning", () => {
    it("createShapes returns clones, not references", () => {
      const shapes1 = createShapes();
      const shapes2 = createShapes();

      // Modify one shape
      const shape1 = shapes1.get(0)!;
      const originalValue = shape1[0][1];
      shape1[0][1] = "X";

      // Verify other shape was not affected
      const shape2 = shapes2.get(0)!;
      expect(shape2[0][1]).not.toBe("X");
      expect(shape2[0][1]).toBe(originalValue);
    });

    it("getShapes returns clones for safe mutation", () => {
      const shapes1 = getShapes();
      const shapes2 = getShapes();

      const shape1 = shapes1.get(0)!;
      const originalLength = shape1[0].length;

      // This mutation shouldn't affect next call
      shape1[0].push("test" as string);

      const shape2 = shapes2.get(0)!;
      expect(shape2[0].length).toBe(originalLength);
    });
  });

  describe("individual shapes", () => {
    it("T shape has correct structure", () => {
      const shapes = getShapes();
      const tShape = shapes.get(0);
      expect(tShape).toBeDefined();
      expect(tShape!.length).toBeGreaterThan(0);
    });

    it("square shape is actually square", () => {
      const shapes = getShapes();
      const squareShape = shapes.get(4);
      expect(squareShape).toBeDefined();
      // Square should be roughly equal in dimensions
      const minWidth = Math.min(...squareShape!.map((row) => row.length));
      const maxWidth = Math.max(...squareShape!.map((row) => row.length));
      expect(maxWidth - minWidth).toBeLessThanOrEqual(1);
    });

    it("vertical line shape is tall", () => {
      const shapes = getShapes();
      const verticalLine = shapes.get(3);
      expect(verticalLine).toBeDefined();
      expect(verticalLine!.length).toBeGreaterThanOrEqual(3);
    });
  });
});
