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

    // add empty rows to pad shape to consistent height (4 rows is max shape height)
    const maxShapeHeight = 4;
    const currentShapeHeight = shape.length - 1; // -1 because we already added nextRow
    const rowsNeeded = maxShapeHeight - currentShapeHeight;

    for (let i = 0; i < rowsNeeded; i++) {
      shape.push(emptyRow);
    }

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

    // add empty row for spacing
    shape.push(emptyRow);

    // add Game Boy control schema with arrow symbols - left aligned
    // ⟳
    //   ↑
    // ← ↓ →
    // L D R
    const rotateLabelRow = Array.from({ length: previewChamber[0].length }).map(
      () => PREVIEW
    );
    rotateLabelRow[2] = "⟳";
    shape.push(rotateLabelRow);

    const rotateRow = Array.from({ length: previewChamber[0].length }).map(
      () => PREVIEW
    );
    rotateRow[2] = "↑";
    shape.push(rotateRow);

    const controlRow = Array.from({ length: previewChamber[0].length }).map(
      () => PREVIEW
    );
    controlRow[0] = "←";
    controlRow[2] = "↓";
    controlRow[4] = "→";
    shape.push(controlRow);

    // Row with labels: L D R
    const labelRow = Array.from({ length: previewChamber[0].length }).map(
      () => PREVIEW
    );
    labelRow[0] = "L";
    labelRow[2] = "D";
    labelRow[4] = "R";
    shape.push(labelRow);

    // add empty row for spacing
    shape.push(emptyRow);

    // add pause and quit controls
    // ":pause (using double quotes to show space)
    const pauseRow = Array.from({ length: previewChamber[0].length }).map(
      () => PREVIEW
    );
    const pauseText = '" ":pause';
    for (let i = 0; i < pauseText.length && i < previewChamber[0].length; i++) {
      pauseRow[i] = pauseText[i];
    }
    shape.push(pauseRow);

    // Q:quit
    const quitRow = Array.from({ length: previewChamber[0].length }).map(
      () => PREVIEW
    );
    const quitText = "Q:quit";
    for (let i = 0; i < quitText.length && i < previewChamber[0].length; i++) {
      quitRow[i] = quitText[i];
    }
    shape.push(quitRow);

    // write the shape with the next word to the chamber
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        const shapeChar = shape[i][j];
        const controlChars = ["↑", "←", "↓", "→"];
        const labels = [
          "⟳",
          "L",
          "D",
          "R",
          "s",
          "p",
          "a",
          "c",
          "e",
          ":",
          "u",
          "Q",
          "q",
          "i",
          "t",
          '"',
        ];

        if (typeof shapeChar !== "undefined") {
          previewChamber[i][j] =
            shapeChar === LIVE ||
            nextWord.includes(shapeChar) ||
            levelWord.includes(shapeChar) ||
            controlChars.includes(shapeChar) ||
            labels.includes(shapeChar) ||
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
