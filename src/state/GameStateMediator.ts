import type { IDifficultyLevel } from "src/difficulty/DifficultyLevel";

/**
 * Represents the different game states/phases
 */
export type GamePhase = "splash" | "demo" | "playing" | "game-over";

/**
 * Events that modes can emit to signal state changes
 */
export interface GameStateEvent {
  type: GameStateEventType;
  payload?: unknown;
}

export type GameStateEventType =
  | "user-pressed-play-from-splash"
  | "splash-timeout-start-demo"
  | "user-pressed-play-during-demo"
  | "difficulty-selected"
  | "game-over"
  | "user-quit"
  | "restart-game";

/**
 * The game state mediator - single source of truth for game state
 * Modes communicate with this instead of directly with each other
 */
export class GameStateMediator {
  private currentPhase: GamePhase = "splash";
  private selectedDifficulty: IDifficultyLevel | null = null;
  private isUserInitiatedGame = false;
  private eventListeners: Map<
    GameStateEventType,
    Set<(event: GameStateEvent) => void>
  > = new Map();

  // ===== Phase Management =====

  getCurrentPhase(): GamePhase {
    return this.currentPhase;
  }

  setPhase(phase: GamePhase): void {
    this.currentPhase = phase;
  }

  isInPhase(phase: GamePhase): boolean {
    return this.currentPhase === phase;
  }

  // ===== Difficulty Management =====

  getSelectedDifficulty(): IDifficultyLevel | null {
    return this.selectedDifficulty;
  }

  setSelectedDifficulty(difficulty: IDifficultyLevel): void {
    this.selectedDifficulty = difficulty;
    this.emit({
      type: "difficulty-selected",
      payload: difficulty,
    });
  }

  // ===== User Initiation Tracking =====

  isUserInitiated(): boolean {
    return this.isUserInitiatedGame;
  }

  setUserInitiated(initiated: boolean): void {
    this.isUserInitiatedGame = initiated;
  }

  // ===== Event System =====

  on(
    eventType: GameStateEventType,
    handler: (event: GameStateEvent) => void
  ): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(handler);
  }

  off(
    eventType: GameStateEventType,
    handler: (event: GameStateEvent) => void
  ): void {
    this.eventListeners.get(eventType)?.delete(handler);
  }

  emit(event: GameStateEvent): void {
    const handlers = this.eventListeners.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => handler(event));
    }
  }

  // ===== Reset =====

  reset(): void {
    this.currentPhase = "splash";
    this.selectedDifficulty = null;
    this.isUserInitiatedGame = false;
  }
}

// Singleton instance
let instance: GameStateMediator | null = null;

export function getGameStateMediator(): GameStateMediator {
  if (!instance) {
    instance = new GameStateMediator();
  }
  return instance;
}

export function resetGameStateMediator(): void {
  instance = null;
}
