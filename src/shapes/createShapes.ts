import type { Shape } from "src/types";
import leftL from "src/shapes/leftL";
import T from "src/shapes/T";
import rightL from "src/shapes/rightL";
import verticalLine from "src/shapes/verticalLine";
import square from "src/shapes/square";
import leftSigma from "src/shapes/leftSigma";
import rightSigma from "src/shapes/rightSigma";
import { SIDE_WALL, EMPTY, NUM_OF_COLS } from "src/constants/constants";
import clone, { cloneMap } from "utils/clone";

const padShape = (shape: Shape, targetWidth: number): Shape => {
  return clone(shape).map((row) => {
    const currentWidth = row.length;
    // remove two for side walls
    const totalPadding = targetWidth - currentWidth - 2;
    const leftPad = Math.floor(totalPadding / 2);
    const rightPad = totalPadding - leftPad;

    return [
      SIDE_WALL,
      ...Array(leftPad).fill(EMPTY),
      ...row,
      ...Array(rightPad).fill(EMPTY),
      SIDE_WALL,
    ];
  });
};

const shapes = new Map<number, Shape>();

export const getShapes = (): Map<number, Shape> => {
  if (shapes.size === 0) {
    shapes.set(0, T);
    shapes.set(1, leftL);
    shapes.set(2, rightL);
    shapes.set(3, verticalLine);
    shapes.set(4, square);
    shapes.set(5, leftSigma);
    shapes.set(6, rightSigma);
  }

  return cloneMap<number, Shape>(shapes);
};

const createShapes = (): Map<number, Shape> => {
  const shapes = getShapes();
  // Pad all shapes to match NUM_OF_COLS
  for (const [key, shape] of shapes.entries()) {
    shapes.set(key, padShape(shape, NUM_OF_COLS));
  }

  return shapes;
};

export default createShapes;
