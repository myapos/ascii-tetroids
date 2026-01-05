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
import {
  MAX_CHAMBER_HEIGHT,
  NUM_OF_COLS,
  DIFFICULTY_SELECTION_TIMEOUT,
} from "src/constants/constants";
import { UserMove } from "src/types";
import type { IGameMode } from "src/modes/IGameMode";
import { SoundManager } from "src/audio/SoundManager";
import { BackgroundMusic } from "src/audio/BackgroundMusic";
import type { GameStateMediator } from "src/state/GameStateMediator";
import { ModeLifecycle } from "src/state/ModeLifecycle";

export class ClassicMode implements IGameMode {
  private gameLogic: GameLogic;
  private renderer: Renderer;
  private inputHandler: InputHandler;
  private mediator: GameStateMediator;
  private demoSequence: UserMove[] | null = null;
  private demoMoveIndex = 0;
  private onRenderCallback: (() => void) | null = null;
  private rotateListener: ((event: unknown) => void) | null = null;
  private isInDemoMode = false;
  private soundManager: SoundManager;
  private backgroundMusic: BackgroundMusic;
  private selectedDifficulty: IDifficultyLevel | null = null;
  private isShowingDifficultyMenu = false;
  private lastMenuTime = 0;
  private modeLifecycle!: ModeLifecycle;

  constructor(
    gameLogic: GameLogic,
    renderer: Renderer,
    inputHandler: InputHandler,
    mediator: GameStateMediator,
    demoSequence?: UserMove[],
    onRenderCallback?: () => void
  ) {
    this.gameLogic = gameLogic;
    this.renderer = renderer;
    this.inputHandler = inputHandler;
    this.mediator = mediator;
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
    this.selectedDifficulty = null;

    // Initialize preview with the next shape
    gameState.previewChamber = PreviewManager.addPreviewNextShape(
      gameLoopState.newShapeIdx,
      gameState.previewChamber,
      gameState.level,
      gameState.score,
      difficulty
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

  private registerMovementHandlers(
    gameState: GameState,
    gameLoopState: {
      keyQueue: UserMove[];
      lastGravityTime: number;
      hasRested: boolean;
      newShapeIdx: number;
      gameOverHandled: boolean;
      needsRender: boolean;
    }
  ): void {
    const MAX_QUEUE_SIZE = 2000;

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

    this.inputHandler.on("move-left", moveLeftHandler);
    this.inputHandler.on("move-right", moveRightHandler);
    this.inputHandler.on("move-down", moveDownHandler);
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

  private showDifficultyMenuSync(): Promise<IDifficultyLevel> {
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
        // Clear 12 lines to account for all spacing and text
        for (let i = 0; i < 12; i++) {
          Terminal.clearPreviousLine();
        }
        this.inputHandler.unregisterDifficultySelectionHandlers(
          easyHandler,
          normalHandler,
          hardHandler
        );
        resolve(new EasyDifficulty());
      };

      const normalHandler = () => {
        if (timeoutId) clearTimeout(timeoutId);
        // Clear 12 lines to account for all spacing and text
        for (let i = 0; i < 12; i++) {
          Terminal.clearPreviousLine();
        }
        this.inputHandler.unregisterDifficultySelectionHandlers(
          easyHandler,
          normalHandler,
          hardHandler
        );
        resolve(new NormalDifficulty());
      };

      const hardHandler = () => {
        if (timeoutId) clearTimeout(timeoutId);
        // Clear 12 lines to account for all spacing and text
        for (let i = 0; i < 12; i++) {
          Terminal.clearPreviousLine();
        }
        this.inputHandler.unregisterDifficultySelectionHandlers(
          easyHandler,
          normalHandler,
          hardHandler
        );
        resolve(new HardDifficulty());
      };

      // Register handlers
      this.inputHandler.registerDifficultySelectionHandlers(
        easyHandler,
        normalHandler,
        hardHandler
      );

      // Set 15-second timeout to default to Normal
      timeoutId = setTimeout(() => {
        // Clear 12 lines (menu text + spacing)
        for (let i = 0; i < 12; i++) {
          Terminal.clearPreviousLine();
        }
        this.inputHandler.unregisterDifficultySelectionHandlers(
          easyHandler,
          normalHandler,
          hardHandler
        );
        resolve(new NormalDifficulty());
      }, DIFFICULTY_SELECTION_TIMEOUT);
    });
  }

  async play(
    gameState: GameState,
    difficulty: IDifficultyLevel
  ): Promise<void> {
    const mediator = this.mediator;
    this.modeLifecycle = new ModeLifecycle(this.inputHandler);
    this.modeLifecycle.activate();

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

    if (!this.isInDemoMode) {
      this.resetGameLoopState(gameState, difficulty, gameLoopState);
    }

    if (!this.demoSequence?.length) {
      this.registerMovementHandlers(gameState, gameLoopState);
    }

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
    this.modeLifecycle.registerListener("rotate", this.rotateListener);

    this.modeLifecycle.registerListener("play-again", () => {
      if (!gameState.isActive) {
        const now = Date.now();
        if (now - this.lastMenuTime < 500) {
          return;
        }
        this.lastMenuTime = now;

        this.showDifficultyMenuSync()
          .then((selectedDifficulty) => {
            difficulty = selectedDifficulty;
            this.resetGameLoopState(gameState, difficulty, gameLoopState);
          })
          .catch((err) => {
            console.error(
              "DEBUG: Error in difficulty selection (play-again):",
              err
            );
          });
      }
    });

    if (!this.isInDemoMode) {
      this.modeLifecycle.registerListener("play", () => {
        // Only respond to play when game is NOT active (i.e., game is over)
        // This prevents unwanted menu flashes during transitions
        if (gameState.isActive) {
          return;
        }

        // Debounce: prevent showing menu multiple times within 500ms
        const now = Date.now();
        if (now - this.lastMenuTime < 500) {
          return;
        }
        this.lastMenuTime = now;

        // Prevent showing menu multiple times simultaneously
        if (this.isShowingDifficultyMenu) {
          return;
        }

        // Only show menu if we haven't already selected difficulty for this session
        if (this.selectedDifficulty !== null) {
          return;
        }

        // Mark that we're showing the menu
        this.isShowingDifficultyMenu = true;

        // Show difficulty selection menu
        this.showDifficultyMenuSync()
          .then((selectedDifficulty) => {
            this.selectedDifficulty = selectedDifficulty;

            // Update difficulty reference
            difficulty = selectedDifficulty;

            // Reset game loop state for fresh start
            this.resetGameLoopState(gameState, difficulty, gameLoopState);

            // Enable movement input handlers for player mode
            this.registerMovementHandlers(gameState, gameLoopState);

            // Register pause handler now that we're in player mode
            this.modeLifecycle.registerListener("pause", () => {
              // Ignore pause after game over
              if (!gameState.isActive) return;

              gameState.isPaused = !gameState.isPaused;
              if (gameState.isPaused) {
                Terminal.write(
                  Terminal.colorizeText(
                    "GAME PAUSED - Press 'space' to resume\n"
                  )
                );
              } else {
                Terminal.clearPreviousLine();
                gameLoopState.needsRender = true;
              }
            });

            this.clearFooter();
          })
          .catch((err) => {
            console.error("DEBUG: Error in difficulty selection:", err);
          })
          .finally(() => {
            // Mark that menu is no longer showing
            this.isShowingDifficultyMenu = false;
          });
      });
    }

    // Setup control handlers - pause enabled only in player mode
    if (!this.isInDemoMode) {
      this.modeLifecycle.registerListener("pause", () => {
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

    this.modeLifecycle.registerListener("quit", () => {
      gameState.isActive = false;
      this.backgroundMusic.stop();
      this.renderer.exitGame();
      process.exit(0);
    });

    this.modeLifecycle.registerListener("volume-up", () => {
      this.increaseVolume();
    });

    this.modeLifecycle.registerListener("volume-down", () => {
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
      gameState.score,
      difficulty
    );

    try {
      // Main game loop
      while (true) {
        // Check if user pressed P during demo to exit and switch to player mode
        // Mediator now tracks the phase change
        if (this.isInDemoMode && mediator.getCurrentPhase() === "playing") {
          break;
        }

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
            gameState.score,
            difficulty
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
        // Stop calling callback immediately when transitioning to player mode
        if (
          this.onRenderCallback &&
          this.demoSequence &&
          mediator.getCurrentPhase() === "demo"
        ) {
          this.onRenderCallback();
        }
      }
    } finally {
      // Clean up all listeners and resources
      this.modeLifecycle.cleanup();
    }
  }
}
