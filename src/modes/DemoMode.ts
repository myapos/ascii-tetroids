import type { IGameMode } from "src/modes/IGameMode";
import type { GameState } from "src/domain/GameState";
import type { IDifficultyLevel } from "src/difficulty/DifficultyLevel";
import type { UserMove } from "src/types";
import { ClassicMode } from "src/modes/ClassicMode";
import { GameLogic } from "src/game/GameLogic";
import { Renderer } from "src/rendering/Renderer";
import { InputHandler } from "src/input/InputHandler";
import { Terminal } from "src/rendering/Terminal";
import { readMovements } from "src/utils/readMovements";
import chalk from "chalk";
import {
  splashScreenConfig,
  splashScreenLines,
} from "src/modes/splashScreenConfig";
import { demoFooterConfig, demoFooterLines } from "src/modes/demoFooterConfig";
import { SPLASH_SCREEN_DELAY } from "src/constants/constants";

export class DemoMode implements IGameMode {
  private gameLogic: GameLogic;
  private renderer: Renderer;
  private inputHandler: InputHandler;
  private classicMode!: ClassicMode;
  private wasUserInitiated = false;
  private playListener: ((event: unknown) => void) | null = null;

  constructor(
    gameLogic: GameLogic,
    renderer: Renderer,
    inputHandler: InputHandler
  ) {
    this.gameLogic = gameLogic;
    this.renderer = renderer;
    this.inputHandler = inputHandler;
  }

  async initialize(): Promise<void> {
    const movements = (await readMovements()) as UserMove[];
    this.classicMode = new ClassicMode(
      this.gameLogic,
      this.renderer,
      this.inputHandler,
      movements,
      () => this.displayDemoFooter()
    );
  }

  async play(
    gameState: GameState,
    difficulty: IDifficultyLevel
  ): Promise<void> {
    await this.initialize();
    this.displaySplashScreen();

    // Wait for user to press P or timeout
    const userInitiatedPlay = await this.waitForPlayOrTimeout();

    // Clean up splash screen listener before entering game mode
    if (this.playListener) {
      this.inputHandler.off("play", this.playListener);
    }

    const mode = new ClassicMode(
      this.gameLogic,
      this.renderer,
      this.inputHandler,
      userInitiatedPlay ? undefined : await readMovements(),
      userInitiatedPlay ? undefined : () => this.displayDemoFooter()
    );
    await mode.play(gameState, difficulty);
  }

  private async waitForPlayOrTimeout(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      let userPressed = false;

      this.playListener = () => {
        userPressed = true;
        this.wasUserInitiated = true;
        resolve(true);
      };

      this.inputHandler.on("play", this.playListener);
      this.inputHandler.start();

      // Timeout after 10 seconds to auto-start demo
      setTimeout(() => {
        if (!userPressed) {
          resolve(false);
        }
      }, SPLASH_SCREEN_DELAY);
    });
  }

  private displaySplashScreen(): void {
    Terminal.moveCursorHome();
    console.clear();

    const splashArt = splashScreenLines
      .map((line) => this.formatLine(line, splashScreenConfig))
      .join("\n");
    console.log(splashArt);
  }

  private formatLine(
    line: { type: string; leading?: number; text?: string },
    config: {
      contentWidth: number;
      borderLeft?: string;
      borderRight?: string;
      padding: string;
    }
  ): string {
    const {
      contentWidth,
      borderLeft = chalk.cyan("║"),
      borderRight = chalk.cyan("║"),
      padding,
    } = config;

    switch (line.type) {
      case "top":
        return `${padding}${chalk.cyan("╔")}${chalk.cyan(
          "═".repeat(contentWidth)
        )}${chalk.cyan("╗")}`;
      case "divider":
        return `${padding}${chalk.cyan("╠")}${chalk.cyan(
          "═".repeat(contentWidth)
        )}${chalk.cyan("╣")}`;
      case "bottom":
        return `${padding}${chalk.cyan("╚")}${chalk.cyan(
          "═".repeat(contentWidth)
        )}${chalk.cyan("╝")}`;
      case "empty":
        return `${padding}${borderLeft}${" ".repeat(
          contentWidth
        )}${borderRight}`;
      case "content": {
        const leadingSpaces = " ".repeat(line.leading || 0);
        const textLength = this.stripAnsi(line.text || "");
        const rightPadding = Math.max(
          0,
          contentWidth - line.leading! - textLength.length
        );
        return `${padding}${borderLeft}${leadingSpaces}${line.text}${" ".repeat(
          rightPadding
        )}${borderRight}`;
      }
      default:
        return "";
    }
  }

  private stripAnsi(str: string): string {
    const ansiRegex = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");
    return str.replace(ansiRegex, "");
  }

  private displayDemoFooter(): void {
    const footerSplashArt = demoFooterLines
      .map((line) => this.formatLine(line, demoFooterConfig))
      .join("\n");
    console.log(footerSplashArt);
  }

  isUserInitiated(): boolean {
    return this.wasUserInitiated;
  }

  resetUserInitiatedFlag(): void {
    this.wasUserInitiated = false;
  }
}
