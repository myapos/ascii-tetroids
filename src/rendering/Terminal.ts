/**
 * Terminal ANSI utilities
 * Extracted from mainEngine for reusability
 */

import chalk from "chalk";
import {
  LIVE,
  REST,
  FLOOR,
  SIDE_WALL,
  EMPTY,
  PREVIEW,
} from "src/constants/constants";

export class Terminal {
  static moveCursorHome() {
    process.stdout.write("\x1b[H");
  }

  static hideCursor() {
    process.stdout.write("\x1b[?25l");
  }

  static showCursor() {
    process.stdout.write("\x1b[?25h");
  }

  static enterAltScreen() {
    process.stdout.write("\x1b[?1049h");
  }

  static exitAltScreen() {
    process.stdout.write("\x1b[?1049l");
  }

  static moveCursorUpOneLine() {
    process.stdout.write("\x1b[1A");
  }

  static clearLine() {
    process.stdout.write("\x1b[2K");
  }

  static clearPreviousLine() {
    this.moveCursorUpOneLine();
    this.clearLine();
  }

  static write(text: string) {
    process.stdout.write(text);
  }

  static writeLine(text: string) {
    process.stdout.write(text + "\n");
  }

  static sleep(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }

  /**
   * Colorize a single cell character for game display
   * Central method to ensure consistent color scheme across the app
   */
  static colorizeCell(cell: string): string {
    if (Number.isSafeInteger(parseInt(cell))) {
      return chalk.yellowBright(cell);
    }

    // Arrow symbols in cyan
    if (/[↑←↓→]/.test(cell)) {
      return chalk.cyan(cell);
    }

    // All preview text and labels (letters except O, colon, double quote) in yellowBright
    if (/[A-NP-Za-np-z:"' ⟳]/.test(cell)) {
      return chalk.yellowBright(cell);
    }

    switch (cell) {
      case LIVE:
        return chalk.greenBright(cell);
      case REST:
        return chalk.white(cell);
      case FLOOR:
        return chalk.magentaBright(cell);
      case SIDE_WALL:
        return chalk.blue(cell);
      case EMPTY:
        return chalk.gray(cell);
      case PREVIEW:
        return chalk.gray(cell);
      default:
        return cell;
    }
  }

  /**
   * Colorize text for UI messages (yellow)
   */
  static colorizeText(text: string): string {
    return chalk.yellowBright(text);
  }
}
