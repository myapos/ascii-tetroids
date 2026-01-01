import type { IDifficultyLevel } from "src/difficulty/DifficultyLevel";
import type { GameState } from "src/domain/GameState";

export interface IGameMode {
  play(gameState: GameState, difficulty: IDifficultyLevel): Promise<void>;
}
