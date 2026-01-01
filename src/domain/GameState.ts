import type { Chamber } from "src/types";

export interface IGameState {
  chamber: Chamber;
  previewChamber: Chamber;
  level: number;
  score: number;
  totalFilledRows: number;
  gravitySpeed: number;
  isPaused: boolean;
  isActive: boolean;
}

export class GameState implements IGameState {
  chamber: Chamber;
  previewChamber: Chamber;
  level: number = 1;
  score: number = 0;
  totalFilledRows: number = 0;
  gravitySpeed: number;
  isPaused: boolean = false;
  isActive: boolean = true;

  constructor(chamber: Chamber, previewChamber: Chamber, gravitySpeed: number) {
    this.chamber = chamber;
    this.previewChamber = previewChamber;
    this.gravitySpeed = gravitySpeed;
  }

  reset(chamber: Chamber, previewChamber: Chamber, gravitySpeed: number) {
    this.chamber = chamber;
    this.previewChamber = previewChamber;
    this.level = 1;
    this.score = 0;
    this.totalFilledRows = 0;
    this.gravitySpeed = gravitySpeed;
    this.isPaused = false;
    this.isActive = true;
  }
}
