import type { Chamber } from "src/types";
import { Terminal } from "./Terminal";

export class Renderer {
  private frameRate: number;

  constructor(frameRate: number = 50) {
    this.frameRate = frameRate;
  }

  async renderFrame(chamber: Chamber, previewChamber: Chamber) {
    const visibleRows = chamber.map((row, i) => [...row, ...previewChamber[i]]);

    Terminal.moveCursorHome();
    Terminal.write(
      visibleRows
        .map((row) => row.map((cell) => Terminal.colorizeCell(cell)).join(""))
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
