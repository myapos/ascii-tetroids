import type { IGameMode } from "src/modes/IGameMode";
import type { GameState } from "src/domain/GameState";
import type { IDifficultyLevel } from "src/difficulty/DifficultyLevel";
import {
  EasyDifficulty,
  NormalDifficulty,
  HardDifficulty,
} from "src/difficulty/DifficultyLevel";
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
import {
  SPLASH_SCREEN_DELAY,
  DIFFICULTY_SELECTION_TIMEOUT,
} from "src/constants/constants";

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
    const { userInitiatedPlay, selectedDifficulty } =
      await this.waitForPlayOrTimeout(difficulty);

    // Clean up splash screen listener before entering game mode
    if (this.playListener) {
      this.inputHandler.off("play", this.playListener);
    }

    // Use selected difficulty if user initiated play, otherwise use default
    const gameModeDifficulty = selectedDifficulty || difficulty;

    const mode = new ClassicMode(
      this.gameLogic,
      this.renderer,
      this.inputHandler,
      userInitiatedPlay ? undefined : await readMovements(),
      userInitiatedPlay ? undefined : () => this.displayDemoFooter()
    );
    await mode.play(gameState, gameModeDifficulty);
  }

  private async waitForPlayOrTimeout(
    defaultDifficulty: IDifficultyLevel
  ): Promise<{
    userInitiatedPlay: boolean;
    selectedDifficulty?: IDifficultyLevel;
  }> {
    return new Promise((resolve) => {
      let userPressed = false;

      this.playListener = async () => {
        userPressed = true;
        this.wasUserInitiated = true;

        // Show difficulty menu
        const selectedDifficulty = await this.showDifficultyMenu();
        resolve({ userInitiatedPlay: true, selectedDifficulty });
      };

      this.inputHandler.on("play", this.playListener);
      this.inputHandler.start();

      // Timeout after 10 seconds to auto-start demo
      setTimeout(() => {
        if (!userPressed) {
          resolve({
            userInitiatedPlay: false,
            selectedDifficulty: defaultDifficulty,
          });
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

  private async showDifficultyMenu(): Promise<IDifficultyLevel> {
    Terminal.write(
      Terminal.colorizeText(
        "\n\nSELECT DIFFICULTY:\n\n1 - Easy\n2 - Normal (default)\n3 - Hard\n\nSelection will default to Normal in 15 seconds...\n\n"
      )
    );

    return new Promise((resolve) => {
      let timeoutId: NodeJS.Timeout | null = null;

      const easyHandler = () => {
        if (timeoutId) clearTimeout(timeoutId);
        for (let i = 0; i < 12; i++) {
          Terminal.clearPreviousLine();
        }
        this.inputHandler.off("difficulty-easy", easyHandler);
        this.inputHandler.off("difficulty-normal", normalHandler);
        this.inputHandler.off("difficulty-hard", hardHandler);
        resolve(new EasyDifficulty());
      };

      const normalHandler = () => {
        if (timeoutId) clearTimeout(timeoutId);
        for (let i = 0; i < 12; i++) {
          Terminal.clearPreviousLine();
        }
        this.inputHandler.off("difficulty-easy", easyHandler);
        this.inputHandler.off("difficulty-normal", normalHandler);
        this.inputHandler.off("difficulty-hard", hardHandler);
        resolve(new NormalDifficulty());
      };

      const hardHandler = () => {
        if (timeoutId) clearTimeout(timeoutId);
        for (let i = 0; i < 12; i++) {
          Terminal.clearPreviousLine();
        }
        this.inputHandler.off("difficulty-easy", easyHandler);
        this.inputHandler.off("difficulty-normal", normalHandler);
        this.inputHandler.off("difficulty-hard", hardHandler);
        resolve(new HardDifficulty());
      };

      this.inputHandler.on("difficulty-easy", easyHandler);
      this.inputHandler.on("difficulty-normal", normalHandler);
      this.inputHandler.on("difficulty-hard", hardHandler);

      timeoutId = setTimeout(() => {
        for (let i = 0; i < 12; i++) {
          Terminal.clearPreviousLine();
        }
        this.inputHandler.off("difficulty-easy", easyHandler);
        this.inputHandler.off("difficulty-normal", normalHandler);
        this.inputHandler.off("difficulty-hard", hardHandler);
        resolve(new NormalDifficulty());
      }, DIFFICULTY_SELECTION_TIMEOUT);
    });
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
