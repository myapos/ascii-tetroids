import type { Chamber } from "src/types";
import {
  PREVIEW,
  LIVE,
  PREVIEW_COLS,
  MAX_CHAMBER_HEIGHT,
} from "src/constants/constants";
import { getShapes } from "src/shapes/createShapes";

export class PreviewManager {
  static emptyPreviewArea(previewChamber: Chamber): void {
    for (let i = 0; i < previewChamber.length; i++) {
      for (let j = 0; j < previewChamber[0].length; j++) {
        previewChamber[i][j] = PREVIEW;
      }
    }
  }

  static addPreviewNextShape(
    shapeIdx: number,
    previewChamber: Chamber,
    curLevel: number
  ): Chamber {
    const emptyRow = Array.from({ length: previewChamber[0].length }).map(
      () => PREVIEW
    );

    const shape = getShapes().get(shapeIdx)!;
    this.emptyPreviewArea(previewChamber);

    // add a row with the word 'NEXT'
    const nextWord = ["N", "E", "X", "T"];
    const nextRow = [];

    for (let i = 0; i < previewChamber[0].length; i++) {
      if (i < nextWord.length) {
        nextRow.push(nextWord[i]);
      } else {
        nextRow.push(PREVIEW);
      }
    }

    shape.unshift(nextRow);

    // add an empty row
    shape.push(emptyRow);

    // add a row with the word 'LEVEL'
    const levelWord = ["L", "E", "V", "E", "L"];
    const levelRow = [];

    for (let i = 0; i < previewChamber[0].length; i++) {
      if (i < levelWord.length) {
        levelRow.push(levelWord[i]);
      } else {
        levelRow.push(PREVIEW);
      }
    }

    shape.push(levelWord);
    // add cur level
    const curLevelInfo = [curLevel.toString()];
    shape.push(curLevelInfo);

    // write the shape with the next word to the chamber
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        const shapeChar = shape[i][j];

        if (typeof shapeChar !== "undefined") {
          previewChamber[i][j] =
            shapeChar === LIVE ||
            nextWord.includes(shapeChar) ||
            levelWord.includes(shapeChar) ||
            Number.isSafeInteger(parseInt(shapeChar))
              ? shapeChar
              : PREVIEW;
        }
      }
    }

    return previewChamber;
  }

  static initializeChamber(): Chamber {
    return Array.from({ length: MAX_CHAMBER_HEIGHT }).map(() => {
      return Array.from({ length: PREVIEW_COLS }).map(() => PREVIEW);
    });
  }
}
