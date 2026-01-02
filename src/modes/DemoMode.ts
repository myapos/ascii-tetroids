import type { IGameMode } from "src/modes/IGameMode";
import type { GameState } from "src/domain/GameState";
import type { IDifficultyLevel } from "src/difficulty/DifficultyLevel";
import { GameLogic } from "src/game/GameLogic";
import { Renderer } from "src/rendering/Renderer";
import { InputHandler } from "src/input/InputHandler";
import { Terminal } from "src/rendering/Terminal";
import {
  DEMO_MOVEMENTS,
  DEMO_MOVE_INTERVAL,
  MAX_CHAMBER_HEIGHT,
  NUM_OF_COLS,
} from "src/constants/constants";
import { PreviewManager } from "src/game/PreviewManager";
import chalk from "chalk";
import {
  splashScreenConfig,
  splashScreenLines,
} from "src/modes/splashScreenConfig";
import { demoFooterConfig, demoFooterLines } from "src/modes/demoFooterConfig";

export class DemoMode implements IGameMode {
  private gameLogic: GameLogic;
  private renderer: Renderer;
  private inputHandler: InputHandler;
  private demoMoveIndex = 0;
  private demoTimer: NodeJS.Timeout | null = null;
  private wasUserInitiated = false;

  constructor(
    gameLogic: GameLogic,
    renderer: Renderer,
    inputHandler: InputHandler
  ) {
    this.gameLogic = gameLogic;
    this.renderer = renderer;
    this.inputHandler = inputHandler;
  }

  async play(
    gameState: GameState,
    difficulty: IDifficultyLevel
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      // Reset state for fresh demo
      this.wasUserInitiated = false;
      this.demoMoveIndex = 0;
      let demoComplete = false;

      // Display splash screen
      this.displaySplashScreen();

      // Start input handler FIRST before any other operations
      this.inputHandler.start();

      // Listen for 'start-game' to exit demo
      const startGameListener = () => {
        demoComplete = true;
        this.wasUserInitiated = true;
        this.stopDemo();
        this.inputHandler.stop();
        resolve();
      };

      this.inputHandler.on("start-game", startGameListener);

      // Wait a moment for splash to be visible, then start demo
      setTimeout(() => {
        // Start demo playback
        this.startDemoPlayback(gameState, difficulty, () => {
          if (!demoComplete) {
            if (this.inputHandler) {
              this.inputHandler.off("start-game", startGameListener);
              this.inputHandler.stop();
            }
            resolve();
          }
        });
      }, 1000);
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

  private displayDemoFooter(): void {
    const footerSplashArt = demoFooterLines
      .map((line) => this.formatLine(line, demoFooterConfig))
      .join("\n");
    console.log(footerSplashArt);
  }

  private stripAnsi(str: string): string {
    const ansiRegex = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");
    return str.replace(ansiRegex, "");
  }

  private startDemoPlayback(
    gameState: GameState,
    difficulty: IDifficultyLevel,
    onComplete: () => void
  ): void {
    const currentGameState = gameState;
    let moveCounter = 0;
    const shapes = this.gameLogic.getShapes();
    let newShapeIdx = Math.floor(Math.random() * shapes.size);
    let lastGravityTime = Date.now();
    let hasRested = false;

    // Initialize preview
    currentGameState.previewChamber = PreviewManager.addPreviewNextShape(
      newShapeIdx,
      currentGameState.previewChamber,
      currentGameState.level
    );

    this.renderer.enterGame();

    const gameLoopInterval = setInterval(() => {
      if (!currentGameState.isActive) {
        clearInterval(gameLoopInterval);
        this.stopDemo();
        this.renderer.exitGame();
        setTimeout(onComplete, 500);
        return;
      }

      // Execute next demo move every DEMO_MOVE_INTERVAL ms
      moveCounter++;
      if (moveCounter > DEMO_MOVE_INTERVAL / 16) {
        moveCounter = 0;
        const moveIndex = this.demoMoveIndex % DEMO_MOVEMENTS.length;
        const move = DEMO_MOVEMENTS[moveIndex];

        // Apply the move to game state
        switch (move) {
          case "<":
            currentGameState.chamber = this.gameLogic.moveShapeWithGas(
              currentGameState.chamber,
              "<"
            );
            break;
          case ">":
            currentGameState.chamber = this.gameLogic.moveShapeWithGas(
              currentGameState.chamber,
              ">"
            );
            break;
          case "rotate":
            currentGameState.chamber = this.gameLogic.rotateShape(
              currentGameState.chamber
            );
            break;
          case "down":
            currentGameState.chamber = this.gameLogic.moveShapeDown(
              currentGameState.chamber
            );
            break;
        }

        this.demoMoveIndex++;
      }

      // Apply gravity
      const now = Date.now();
      if (now - lastGravityTime > currentGameState.gravitySpeed) {
        const result = this.gameLogic.moveShapeDown(currentGameState.chamber);
        const moved = result !== currentGameState.chamber;

        if (moved) {
          currentGameState.chamber = result;
          lastGravityTime = now;
        } else {
          // Shape has rested
          const { numOfFilledRows, chamber: newChamb } =
            this.gameLogic.checkFilledRows(
              currentGameState.chamber,
              NUM_OF_COLS
            );
          currentGameState.chamber = newChamb;
          currentGameState.totalFilledRows += numOfFilledRows;

          // Check level increase
          if (
            currentGameState.totalFilledRows >=
            difficulty.getLevelLinesRequired()
          ) {
            currentGameState.gravitySpeed = Math.max(
              difficulty.getMaximumSpeed(),
              currentGameState.gravitySpeed -
                difficulty.getGravitySpeedIncrement()
            );
            currentGameState.totalFilledRows =
              currentGameState.totalFilledRows %
              difficulty.getLevelLinesRequired();
            currentGameState.level++;
          }

          hasRested = true;

          // Add new shape
          const shape = shapes.get(newShapeIdx)!;
          currentGameState.chamber.splice(0, shape.length);
          currentGameState.chamber.unshift(...shape);
          lastGravityTime = now;

          // Check game over
          const lost = this.gameLogic.checkIfPlayerLost(
            currentGameState.chamber,
            shapes.get(newShapeIdx)!.length,
            MAX_CHAMBER_HEIGHT
          );

          if (lost) {
            currentGameState.isActive = false;
            return;
          }

          newShapeIdx = Math.floor(Math.random() * shapes.size);
        }
      }

      // Update preview chamber
      if (hasRested) {
        currentGameState.previewChamber = PreviewManager.addPreviewNextShape(
          newShapeIdx,
          currentGameState.previewChamber,
          currentGameState.level
        );
        newShapeIdx = Math.floor(Math.random() * shapes.size);
        hasRested = false;
      }

      // Render
      this.renderer.renderFrame(
        currentGameState.chamber,
        currentGameState.previewChamber
      );

      // Show info message about demo mode
      this.displayDemoFooter();
    }, 16); // ~60fps

    this.demoTimer = gameLoopInterval;
  }

  private stopDemo(): void {
    if (this.demoTimer) {
      clearInterval(this.demoTimer);
      this.demoTimer = null;
    }
  }

  isUserInitiated(): boolean {
    return this.wasUserInitiated;
  }

  resetUserInitiatedFlag(): void {
    this.wasUserInitiated = false;
  }
}
