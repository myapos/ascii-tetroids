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
  private demoSequence: UserMove[] | null = null;
  private demoMoveIndex = 0;
  private onRenderCallback: (() => void) | null = null;

  constructor(
    gameLogic: GameLogic,
    renderer: Renderer,
    inputHandler: InputHandler,
    demoSequence?: UserMove[],
    onRenderCallback?: () => void
  ) {
    this.gameLogic = gameLogic;
    this.renderer = renderer;
    this.inputHandler = inputHandler;
    this.demoSequence = demoSequence || null;
    this.onRenderCallback = onRenderCallback || null;
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

    // Setup shape movement input handlers - disabled in demo mode
    if (!this.demoSequence?.length) {
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
    }

    this.inputHandler.on("play-again", () => {
      if (!gameState.isActive) {
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine(); // Clear the game over message
        gameState.reset(
          this.gameLogic.initializeChamber(),
          PreviewManager.initializeChamber(),
          difficulty.getInitialGravitySpeed()
        );
        gameOverHandled = false;
      }
    });

    // Setup start-game listener for demo mode
    if (this.demoSequence) {
      const moveLeftHandler = () => {
        if (keyQueue.length < MAX_QUEUE_SIZE) {
          keyQueue.push("<");
        }
      };

      const moveRightHandler = () => {
        if (keyQueue.length < MAX_QUEUE_SIZE) {
          keyQueue.push(">");
        }
      };

      const moveDownHandler = () => {
        if (keyQueue.length < MAX_QUEUE_SIZE) {
          keyQueue.push("down");
        }
      };

      const rotateHandler = () => {
        if (keyQueue.length < MAX_QUEUE_SIZE) {
          keyQueue.push("rotate");
        }
      };

      this.inputHandler.on("start-game", () => {
        // Switch from demo mode to player mode
        this.demoSequence = null;
        this.demoMoveIndex = 0;

        // Reset game state for fresh start
        gameState.reset(
          this.gameLogic.initializeChamber(),
          PreviewManager.initializeChamber(),
          difficulty.getInitialGravitySpeed()
        );
        gameOverHandled = false;

        // Reset timing variables
        lastGravityTime = Date.now();
        hasRested = false;

        // Select new shape
        newShapeIdx = Math.floor(Math.random() * shapes.size);
        gameState.previewChamber = PreviewManager.addPreviewNextShape(
          newShapeIdx,
          gameState.previewChamber,
          gameState.level
        );

        // Clear any queued moves from demo
        keyQueue.length = 0;

        // Enable movement input handlers
        this.inputHandler.on("move-left", moveLeftHandler);
        this.inputHandler.on("move-right", moveRightHandler);
        this.inputHandler.on("move-down", moveDownHandler);
        this.inputHandler.on("rotate", rotateHandler);

        // Clear footer (3 lines) and print message
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
      });
    }

    // Setup control handlers - always enabled (pause and quit work in all modes)
    this.inputHandler.on("pause", () => {
      gameState.isPaused = !gameState.isPaused;
      if (gameState.isPaused) {
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.write(
          Terminal.colorizeText("\nGAME PAUSED - Press 'space' to resume\n")
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

        // In demo mode, auto-restart
        if (this.demoSequence) {
          gameState.reset(
            this.gameLogic.initializeChamber(),
            PreviewManager.initializeChamber(),
            difficulty.getInitialGravitySpeed()
          );
          gameOverHandled = false;
          this.demoMoveIndex = 0;
          newShapeIdx = Math.floor(Math.random() * shapes.size);
          gameState.previewChamber = PreviewManager.addPreviewNextShape(
            newShapeIdx,
            gameState.previewChamber,
            gameState.level
          );
          continue;
        }

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

      // In demo mode, inject moves from sequence
      if (this.demoSequence) {
        const move =
          this.demoSequence[this.demoMoveIndex % this.demoSequence.length];
        if (keyQueue.length < MAX_QUEUE_SIZE) {
          keyQueue.push(move);
        }
        this.demoMoveIndex++;
        // Slow down demo moves to be visible
        await Terminal.sleep(650);
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

      // Call render callback only if still in demo mode
      if (this.onRenderCallback && this.demoSequence) {
        this.onRenderCallback();
      }
    }
  }
}
