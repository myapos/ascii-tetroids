import type { Chamber } from "src/types";
import { GameState } from "src/domain/GameState";
import { GameLogic } from "./GameLogic";
import { Renderer } from "src/rendering/Renderer";
import { InputHandler } from "src/input/InputHandler";
import { PreviewManager } from "./PreviewManager";
import type { IGameMode } from "src/modes/IGameMode";
import type { IDifficultyLevel } from "src/difficulty/DifficultyLevel";

export class Game {
  private gameState: GameState;
  private gameLogic: GameLogic;
  private renderer: Renderer;
  private inputHandler: InputHandler;
  private difficulty: IDifficultyLevel;
  private gameMode!: IGameMode;

  constructor(
    gameLogic: GameLogic,
    renderer: Renderer,
    inputHandler: InputHandler,
    difficulty: IDifficultyLevel
  ) {
    this.gameLogic = gameLogic;
    this.renderer = renderer;
    this.inputHandler = inputHandler;
    this.difficulty = difficulty;

    // Initialize game state with default chambers
    const initialChamber = this.createChamber();
    const initialPreviewChamber = this.createPreviewChamber();

    this.gameState = new GameState(
      initialChamber,
      initialPreviewChamber,
      this.difficulty.getInitialGravitySpeed()
    );
  }

  private createChamber(): Chamber {
    return this.gameLogic.initializeChamber();
  }

  private createPreviewChamber(): Chamber {
    return PreviewManager.initializeChamber();
  }

  setGameMode(gameMode: IGameMode): void {
    this.gameMode = gameMode;
  }

  setDifficulty(difficulty: IDifficultyLevel): void {
    this.difficulty = difficulty;
    this.gameState.gravitySpeed = difficulty.getInitialGravitySpeed();
  }

  async start(): Promise<void> {
    await this.gameMode.play(this.gameState, this.difficulty);
  }

  reset(): void {
    const initialChamber = this.createChamber();
    const initialPreviewChamber = this.createPreviewChamber();
    this.gameState.reset(
      initialChamber,
      initialPreviewChamber,
      this.difficulty.getInitialGravitySpeed()
    );
  }

  getGameState(): GameState {
    return this.gameState;
  }

  getGameLogic(): GameLogic {
    return this.gameLogic;
  }

  getRenderer(): Renderer {
    return this.renderer;
  }

  getInputHandler(): InputHandler {
    return this.inputHandler;
  }
}
