import type { GameState } from "src/domain/GameState";
import type { IDifficultyLevel } from "src/difficulty/DifficultyLevel";
import {
  EasyDifficulty,
  NormalDifficulty,
  HardDifficulty,
} from "src/difficulty/DifficultyLevel";
import { GameLogic } from "src/game/GameLogic";
import { Renderer } from "src/rendering/Renderer";
import { InputHandler } from "src/input/InputHandler";
import { Terminal } from "src/rendering/Terminal";
import { PreviewManager } from "src/game/PreviewManager";
import { MAX_CHAMBER_HEIGHT, NUM_OF_COLS } from "src/constants/constants";
import { UserMove } from "src/types";
import type { IGameMode } from "src/modes/IGameMode";
import { SoundManager } from "src/audio/SoundManager";
import { BackgroundMusic } from "src/audio/BackgroundMusic";

export class ClassicMode implements IGameMode {
  private gameLogic: GameLogic;
  private renderer: Renderer;
  private inputHandler: InputHandler;
  private demoSequence: UserMove[] | null = null;
  private demoMoveIndex = 0;
  private onRenderCallback: (() => void) | null = null;
  private rotateListener: ((event: unknown) => void) | null = null;
  private isInDemoMode = false;
  private soundManager: SoundManager;
  private backgroundMusic: BackgroundMusic;

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
    this.soundManager = new SoundManager();
    this.backgroundMusic = BackgroundMusic.getInstance();
  }

  private getNewShapeIdx() {
    return Math.floor(Math.random() * this.gameLogic.getShapes().size);
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
    gameLoopState.newShapeIdx = this.getNewShapeIdx();
    gameLoopState.gameOverHandled = false;
    gameLoopState.needsRender = false;
    this.demoMoveIndex = 0;

    // Initialize preview with the first shape
    gameState.previewChamber = PreviewManager.addPreviewNextShape(
      gameLoopState.newShapeIdx,
      gameState.previewChamber,
      gameState.level,
      gameState.score
    );

    // Set game as active
    gameState.isActive = true;
  }

  private clearFooter(): void {
    Terminal.clearPreviousLine();
    Terminal.clearPreviousLine();
    Terminal.clearPreviousLine();
  }

  private increaseVolume(): void {
    this.soundManager.increaseVolume();
    this.backgroundMusic.increaseVolume();
  }

  private decreaseVolume(): void {
    this.soundManager.decreaseVolume();
    this.backgroundMusic.decreaseVolume();
  }

  private beep() {
    this.soundManager.play("move");
  }

  private playLineComplete() {
    this.soundManager.play("lineComplete");
  }

  private playGameLoss() {
    this.soundManager.play("gameLoss");
  }

  private async showDifficultyMenu(): Promise<IDifficultyLevel> {
    Terminal.write(
      Terminal.colorizeText(
        "\n\nSELECT DIFFICULTY:\n\n1 - Easy\n2 - Normal (default)\n3 - Hard\n\nSelection will default to Normal in 15 seconds...\n\n"
      )
    );

    return new Promise((resolve) => {
      let timeoutId: NodeJS.Timeout | null = null;

      // Handle difficulty selection
      const easyHandler = () => {
        if (timeoutId) clearTimeout(timeoutId);
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        this.inputHandler.off("difficulty-easy", easyHandler);
        this.inputHandler.off("difficulty-normal", normalHandler);
        this.inputHandler.off("difficulty-hard", hardHandler);
        resolve(new EasyDifficulty());
      };

      const normalHandler = () => {
        if (timeoutId) clearTimeout(timeoutId);
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        this.inputHandler.off("difficulty-easy", easyHandler);
        this.inputHandler.off("difficulty-normal", normalHandler);
        this.inputHandler.off("difficulty-hard", hardHandler);
        resolve(new NormalDifficulty());
      };

      const hardHandler = () => {
        if (timeoutId) clearTimeout(timeoutId);
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        this.inputHandler.off("difficulty-easy", easyHandler);
        this.inputHandler.off("difficulty-normal", normalHandler);
        this.inputHandler.off("difficulty-hard", hardHandler);
        resolve(new HardDifficulty());
      };

      // Register handlers
      this.inputHandler.on("difficulty-easy", easyHandler);
      this.inputHandler.on("difficulty-normal", normalHandler);
      this.inputHandler.on("difficulty-hard", hardHandler);

      // Set 15-second timeout to default to Normal
      timeoutId = setTimeout(() => {
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        Terminal.clearPreviousLine();
        this.inputHandler.off("difficulty-easy", easyHandler);
        this.inputHandler.off("difficulty-normal", normalHandler);
        this.inputHandler.off("difficulty-hard", hardHandler);
        resolve(new NormalDifficulty());
      }, 15000);
    });
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
      newShapeIdx: this.getNewShapeIdx(),
      gameOverHandled: false,
      needsRender: false,
    };

    const MAX_QUEUE_SIZE = 2000;
    const shapes = this.gameLogic.getShapes();

    // Define movement handlers (for player mode)
    const moveLeftHandler = () => {
      if (
        gameState.isActive &&
        gameLoopState.keyQueue.length < MAX_QUEUE_SIZE
      ) {
        gameLoopState.keyQueue.push("<");
        this.beep();
      }
    };

    const moveRightHandler = () => {
      if (
        gameState.isActive &&
        gameLoopState.keyQueue.length < MAX_QUEUE_SIZE
      ) {
        gameLoopState.keyQueue.push(">");
        this.beep();
      }
    };

    const moveDownHandler = () => {
      if (
        gameState.isActive &&
        gameLoopState.keyQueue.length < MAX_QUEUE_SIZE
      ) {
        gameLoopState.keyQueue.push("down");
        this.beep();
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
      if (
        gameState.isActive &&
        gameLoopState.keyQueue.length < MAX_QUEUE_SIZE &&
        !this.isInDemoMode
      ) {
        gameLoopState.keyQueue.push("rotate");
        this.beep();
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
      this.inputHandler.on("play", async () => {
        // Ignore play if game is already active
        if (gameState.isActive && !this.isInDemoMode) return;

        // Show difficulty selection menu
        const selectedDifficulty = await this.showDifficultyMenu();

        // Switch from demo mode to player mode
        this.demoSequence = null;
        this.isInDemoMode = false;

        // Update difficulty reference
        difficulty = selectedDifficulty;

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
      this.backgroundMusic.stop();
      this.renderer.exitGame();
      process.exit(0);
    });

    this.inputHandler.on("volume-up", () => {
      this.increaseVolume();
    });

    this.inputHandler.on("volume-down", () => {
      this.decreaseVolume();
    });

    // Start input handler AFTER all listeners are registered
    this.inputHandler.start();

    this.renderer.enterGame();

    // Start background music
    this.backgroundMusic.play();

    // Initialize preview with the first shape
    gameState.previewChamber = PreviewManager.addPreviewNextShape(
      gameLoopState.newShapeIdx,
      gameState.previewChamber,
      gameState.level,
      gameState.score
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

          // Play block rest sound
          if (gameState.isActive && !this.isInDemoMode) {
            this.soundManager.play("blockRest");
          }

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
          gameState.score += numOfFilledRows;

          if (numOfFilledRows) {
            this.playLineComplete();
          }

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
            this.playGameLoss();
            gameState.isActive = false;
            continue;
          }

          gameLoopState.newShapeIdx = this.getNewShapeIdx();
        }
      }

      // Update preview chamber with next shape only when shape has rested
      if (gameLoopState.hasRested) {
        gameState.previewChamber = PreviewManager.addPreviewNextShape(
          gameLoopState.newShapeIdx,
          gameState.previewChamber,
          gameState.level,
          gameState.score
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
