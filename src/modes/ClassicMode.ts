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
  private rotateListener: ((event: unknown) => void) | null = null;
  private isInDemoMode = false;

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
    this.isInDemoMode = demoSequence ? demoSequence.length > 0 : false;
    this.onRenderCallback = onRenderCallback || null;
  }

  private resetGameLoopState(
    gameState: GameState,
    difficulty: IDifficultyLevel,
    gameLoopState: {
      keyQueue: UserMove[];
      lastGravityTime: number;
      hasRested: boolean;
      newShapeIdx: number;
      gameOverHandled: boolean;
      needsRender: boolean;
    }
  ): void {
    gameState.reset(
      this.gameLogic.initializeChamber(),
      PreviewManager.initializeChamber(),
      difficulty.getInitialGravitySpeed()
    );

    // Reset game loop state variables
    gameLoopState.keyQueue.length = 0;
    gameLoopState.lastGravityTime = Date.now();
    gameLoopState.hasRested = false;
    gameLoopState.newShapeIdx = Math.floor(
      Math.random() * this.gameLogic.getShapes().size
    );
    gameLoopState.gameOverHandled = false;
    gameLoopState.needsRender = false;
    this.demoMoveIndex = 0;

    // Initialize preview with the first shape
    gameState.previewChamber = PreviewManager.addPreviewNextShape(
      gameLoopState.newShapeIdx,
      gameState.previewChamber,
      gameState.level
    );

    // Set game as active
    gameState.isActive = true;
  }

  private clearFooter(): void {
    Terminal.clearPreviousLine();
    Terminal.clearPreviousLine();
    Terminal.clearPreviousLine();
  }

  async play(
    gameState: GameState,
    difficulty: IDifficultyLevel
  ): Promise<void> {
    // Game loop state object - encapsulates all loop variables
    const gameLoopState = {
      keyQueue: [] as UserMove[],
      lastGravityTime: Date.now(),
      hasRested: false,
      newShapeIdx: Math.floor(Math.random() * this.gameLogic.getShapes().size),
      gameOverHandled: false,
      needsRender: false,
    };

    const MAX_QUEUE_SIZE = 2000;
    const shapes = this.gameLogic.getShapes();

    // Define movement handlers (for player mode)
    const moveLeftHandler = () => {
      if (gameLoopState.keyQueue.length < MAX_QUEUE_SIZE) {
        gameLoopState.keyQueue.push("<");
      }
    };

    const moveRightHandler = () => {
      if (gameLoopState.keyQueue.length < MAX_QUEUE_SIZE) {
        gameLoopState.keyQueue.push(">");
      }
    };

    const moveDownHandler = () => {
      if (gameLoopState.keyQueue.length < MAX_QUEUE_SIZE) {
        gameLoopState.keyQueue.push("down");
      }
    };

    // Register movement handlers only in player mode
    if (!this.demoSequence?.length) {
      this.inputHandler.on("move-left", moveLeftHandler);
      this.inputHandler.on("move-right", moveRightHandler);
      this.inputHandler.on("move-down", moveDownHandler);
    }

    // Rotate is always available (player mode and can be used during demo to switch)
    // Remove old listener if it exists (from previous play() call)
    if (this.rotateListener) {
      this.inputHandler.off("rotate", this.rotateListener);
    }

    this.rotateListener = () => {
      if (gameLoopState.keyQueue.length < MAX_QUEUE_SIZE) {
        gameLoopState.keyQueue.push("rotate");
      }
    };
    this.inputHandler.on("rotate", this.rotateListener);

    this.inputHandler.on("play-again", () => {
      if (!gameState.isActive) {
        this.resetGameLoopState(gameState, difficulty, gameLoopState);
      }
    });

    // Setup play listener for demo mode
    if (this.demoSequence) {
      this.inputHandler.on("play", () => {
        // Ignore play if game is already active
        if (gameState.isActive && !this.isInDemoMode) return;

        // Switch from demo mode to player mode
        this.demoSequence = null;
        this.isInDemoMode = false;

        // Reset game loop state for fresh start
        this.resetGameLoopState(gameState, difficulty, gameLoopState);

        // Enable movement input handlers for player mode
        this.inputHandler.on("move-left", moveLeftHandler);
        this.inputHandler.on("move-right", moveRightHandler);
        this.inputHandler.on("move-down", moveDownHandler);

        // Register pause handler now that we're in player mode
        this.inputHandler.on("pause", () => {
          // Ignore pause after game over
          if (!gameState.isActive) return;

          gameState.isPaused = !gameState.isPaused;
          if (gameState.isPaused) {
            Terminal.write(
              Terminal.colorizeText("GAME PAUSED - Press 'space' to resume\n")
            );
          } else {
            Terminal.clearPreviousLine();
            gameLoopState.needsRender = true;
          }
        });

        this.clearFooter();
      });
    }

    // Setup control handlers - pause enabled only in player mode
    if (!this.isInDemoMode) {
      this.inputHandler.on("pause", () => {
        // Ignore pause after game over
        if (!gameState.isActive) return;

        gameState.isPaused = !gameState.isPaused;
        if (gameState.isPaused) {
          Terminal.write(
            Terminal.colorizeText("GAME PAUSED - Press 'space' to resume\n")
          );
        } else {
          Terminal.clearPreviousLine();
          gameLoopState.needsRender = true;
        }
      });
    }

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
      gameLoopState.newShapeIdx,
      gameState.previewChamber,
      gameState.level
    );

    // Main game loop
    while (true) {
      if (!gameState.isActive && !gameLoopState.gameOverHandled) {
        gameLoopState.gameOverHandled = true;

        // In demo mode, auto-restart
        if (this.demoSequence) {
          this.resetGameLoopState(gameState, difficulty, gameLoopState);
          continue;
        }

        Terminal.write(
          Terminal.colorizeText(
            "\nYOU LOST!! Press 'r' to play again or 'q' to exit\n"
          )
        );
        // Wait for user input (play-again or quit) - skip all game logic
        while (!gameState.isActive) {
          await Terminal.sleep(100);
        }
        // Clear the message when user chooses to play again
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
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
        if (gameLoopState.keyQueue.length < MAX_QUEUE_SIZE) {
          gameLoopState.keyQueue.push(move);
        }
        this.demoMoveIndex++;
        // Slow down demo moves to be visible
        await Terminal.sleep(650);
      }

      // Process all queued input
      while (gameLoopState.keyQueue.length > 0) {
        const move = gameLoopState.keyQueue.shift()!;

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
      if (now - gameLoopState.lastGravityTime > gameState.gravitySpeed) {
        gameLoopState.lastGravityTime = now;

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
          const shape = shapes.get(gameLoopState.newShapeIdx)!;
          gameState.chamber.splice(0, shape.length);
          gameState.chamber.unshift(...shape);

          gameLoopState.lastGravityTime = Date.now(); // Reset gravity timer for new shape

          gameLoopState.keyQueue.length = 0;
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

          gameLoopState.hasRested = true;
          const lost = this.gameLogic.checkIfPlayerLost(
            gameState.chamber,
            shapes.get(gameLoopState.newShapeIdx)!.length,
            MAX_CHAMBER_HEIGHT
          );

          if (lost) {
            gameState.isActive = false;
            continue;
          }

          gameLoopState.newShapeIdx = Math.floor(Math.random() * shapes.size);
        }
      }

      // Update preview chamber with next shape only when shape has rested
      if (gameLoopState.hasRested) {
        gameState.previewChamber = PreviewManager.addPreviewNextShape(
          gameLoopState.newShapeIdx,
          gameState.previewChamber,
          gameState.level
        );
        gameLoopState.hasRested = false;
      }

      // Render once per frame (or when forced, e.g., after unpausing)
      if (gameLoopState.needsRender || !gameState.isPaused) {
        await this.renderer.renderFrame(
          gameState.chamber,
          gameState.previewChamber
        );
        gameLoopState.needsRender = false;
      }

      // Call render callback only if still in demo mode
      if (this.onRenderCallback && this.demoSequence) {
        this.onRenderCallback();
      }
    }
  }
}
