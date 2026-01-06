import type { Chamber } from "src/types";
import { Terminal } from "./Terminal";
import { FRAME_RATE } from "src/constants/constants";

export class Renderer {
  private frameRate: number;

  constructor(frameRate: number = FRAME_RATE) {
    this.frameRate = frameRate;
  }

  async renderFrame(chamber: Chamber, previewChamber: Chamber) {
    Terminal.moveCursorHome();
    Terminal.write(
      chamber
        .map((row, i) => {
          const gameRow = row
            .map((cell) => Terminal.colorizeCell(cell))
            .join(" ");
          const previewRow = previewChamber[i]
            .map((cell) => Terminal.colorizeCell(cell))
            .join("");
          return gameRow + previewRow;
        })
        .join("\n") + "\n"
    );

    await Terminal.sleep(this.frameRate);
  }

  writeLine(text: string) {
    Terminal.writeLine(Terminal.colorizeText(text));
  }

  enterGame() {
    Terminal.enterAltScreen();
    Terminal.hideCursor();
  }

  exitGame() {
    Terminal.exitAltScreen();
    Terminal.showCursor();
  }
}
