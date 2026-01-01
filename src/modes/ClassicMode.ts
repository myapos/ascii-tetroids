import type { IGameMode } from "./IGameMode";
import type { GameState } from "src/domain/GameState";
import type { IDifficultyLevel } from "src/difficulty/DifficultyLevel";
import { GameLogic } from "src/game/GameLogic";
import { Renderer } from "src/rendering/Renderer";
import { InputHandler } from "src/input/InputHandler";
import { Terminal } from "src/rendering/Terminal";
import { PreviewManager } from "src/game/PreviewManager";
import { MAX_CHAMBER_HEIGHT, NUM_OF_COLS } from "src/constants/constants";
import { UserMove } from "src/types";

export class ClassicMode implements IGameMode {
  private gameLogic: GameLogic;
  private renderer: Renderer;
  private inputHandler: InputHandler;

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
    const keyQueue: UserMove[] = [];
    const MAX_QUEUE_SIZE = 2000;

    const shapes = this.gameLogic.getShapes();

    let lastGravityTime = Date.now();
    let hasRested = false;
    let newShapeIdx = Math.floor(Math.random() * shapes.size);
    let gameOverHandled = false;

    // Setup input handlers
    this.inputHandler.on("move-left", () => {
      if (keyQueue.length < MAX_QUEUE_SIZE) {
        keyQueue.push("<");
      }
    });

    this.inputHandler.on("move-right", () => {
      if (keyQueue.length < MAX_QUEUE_SIZE) {
        keyQueue.push(">");
      }
    });

    this.inputHandler.on("move-down", () => {
      if (keyQueue.length < MAX_QUEUE_SIZE) {
        keyQueue.push("down");
      }
    });

    this.inputHandler.on("rotate", () => {
      if (keyQueue.length < MAX_QUEUE_SIZE) {
        keyQueue.push("rotate");
      }
    });

    this.inputHandler.on("pause", () => {
      gameState.isPaused = !gameState.isPaused;
      if (gameState.isPaused) {
        Terminal.write(
          Terminal.colorizeText(
            "\nGAME PAUSED - Press 'p' or space to resume\n"
          )
        );
      } else {
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
      }
    });

    this.inputHandler.on("quit", () => {
      gameState.isActive = false;
      this.renderer.exitGame();
      process.exit(0);
    });

    this.inputHandler.on("play-again", () => {
      if (!gameState.isActive) {
        Terminal.clearPreviousLine(); // Clear the newline after message
        Terminal.clearPreviousLine(); // Clear the game over message
        gameState.reset(
          this.gameLogic.initializeChamber(),
          PreviewManager.initializeChamber(),
          difficulty.getInitialGravitySpeed()
        );
        gameOverHandled = false;
      }
    });

    // Start input handler AFTER all listeners are registered
    this.inputHandler.start();

    this.renderer.enterGame();

    // Initialize preview with the first shape
    gameState.previewChamber = PreviewManager.addPreviewNextShape(
      newShapeIdx,
      gameState.previewChamber,
      gameState.level
    );

    // Main game loop
    while (true) {
      if (!gameState.isActive && !gameOverHandled) {
        gameOverHandled = true;
        Terminal.write(
          Terminal.colorizeText(
            "\nYOU LOST!! Press 'r' to play again or 'q' to exit\n"
          )
        );
        // Wait for user input (play-again or quit)
        while (gameState.isActive === false) {
          await Terminal.sleep(100);
        }
        continue;
      }

      if (gameState.isPaused) {
        await Terminal.sleep(50);
        continue;
      }

      // Process all queued input
      while (keyQueue.length > 0) {
        const move = keyQueue.shift()!;

        if (move === "rotate") {
          gameState.chamber = this.gameLogic.rotateShape(gameState.chamber);
        } else if (move === "<" || move === ">") {
          gameState.chamber = this.gameLogic.moveShapeWithGas(
            gameState.chamber,
            move
          );
        } else if (move === "down") {
          gameState.chamber = this.gameLogic.moveShapeDown(gameState.chamber);
        }
      }

      // Apply gravity
      const now = Date.now();
      if (now - lastGravityTime > gameState.gravitySpeed) {
        lastGravityTime = now;

        const shapeCoordsBefore = this.gameLogic.getShapeCoords(
          gameState.chamber
        );
        gameState.chamber = this.gameLogic.moveShapeDown(gameState.chamber);
        const shapeCoordsAfter = this.gameLogic.getShapeCoords(
          gameState.chamber
        );

        if (
          !this.gameLogic.arraysAreEqual(shapeCoordsBefore, shapeCoordsAfter)
        ) {
          // Shape moved down successfully
        } else {
          // Could not move down → rest the shape
          gameState.chamber = this.gameLogic.restShape(
            gameState.chamber,
            shapeCoordsAfter
          );

          // Add new shape
          const shape = shapes.get(newShapeIdx)!;
          gameState.chamber.splice(0, shape.length);
          gameState.chamber.unshift(...shape);

          lastGravityTime = Date.now(); // Reset gravity timer for new shape

          keyQueue.length = 0;
          const { numOfFilledRows, chamber: newChamb } =
            this.gameLogic.checkFilledRows(gameState.chamber, NUM_OF_COLS);
          gameState.chamber = newChamb;
          gameState.totalFilledRows += numOfFilledRows;

          const shouldIncreaseGravityLevel =
            gameState.totalFilledRows >= difficulty.getLevelLinesRequired();

          if (shouldIncreaseGravityLevel) {
            gameState.gravitySpeed = Math.max(
              difficulty.getMaximumSpeed(),
              gameState.gravitySpeed - difficulty.getGravitySpeedIncrement()
            );
            gameState.totalFilledRows =
              gameState.totalFilledRows % difficulty.getLevelLinesRequired();
            gameState.level++;
          }

          hasRested = true;
          const lost = this.gameLogic.checkIfPlayerLost(
            gameState.chamber,
            shapes.get(newShapeIdx)!.length,
            MAX_CHAMBER_HEIGHT
          );

          if (lost) {
            gameState.isActive = false;
            continue;
          }

          newShapeIdx = Math.floor(Math.random() * shapes.size);
        }
      }

      // Update preview chamber with next shape only when shape has rested
      if (hasRested) {
        gameState.previewChamber = PreviewManager.addPreviewNextShape(
          newShapeIdx,
          gameState.previewChamber,
          gameState.level
        );
        newShapeIdx = Math.floor(Math.random() * shapes.size);
        hasRested = false;
      }

      // Render once per frame
      await this.renderer.renderFrame(
        gameState.chamber,
        gameState.previewChamber
      );
    }
  }
}
