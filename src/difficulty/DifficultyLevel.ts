import {
  GRAVITY_SPEED,
  GRAVITY_LEVEL_DIFF,
  MAXIMUM_SPEED,
  LEVEL_LINES_DIFF,
} from "src/constants/constants";

export interface IDifficultyLevel {
  getInitialGravitySpeed(): number;
  getGravitySpeedIncrement(): number;
  getMaximumSpeed(): number;
  getLevelLinesRequired(): number;
}

export class EasyDifficulty implements IDifficultyLevel {
  getInitialGravitySpeed(): number {
    return GRAVITY_SPEED + 250; // Slower
  }

  getGravitySpeedIncrement(): number {
    return GRAVITY_LEVEL_DIFF * 3;
  }

  getMaximumSpeed(): number {
    return MAXIMUM_SPEED + 100;
  }

  getLevelLinesRequired(): number {
    return LEVEL_LINES_DIFF / 2;
  }
}

export class NormalDifficulty implements IDifficultyLevel {
  getInitialGravitySpeed(): number {
    return GRAVITY_SPEED;
  }

  getGravitySpeedIncrement(): number {
    return GRAVITY_LEVEL_DIFF * 5;
  }

  getMaximumSpeed(): number {
    return MAXIMUM_SPEED;
  }

  getLevelLinesRequired(): number {
    return LEVEL_LINES_DIFF / 2;
  }
}

export class HardDifficulty implements IDifficultyLevel {
  getInitialGravitySpeed(): number {
    return GRAVITY_SPEED - 450; // Faster
  }

  getGravitySpeedIncrement(): number {
    return GRAVITY_LEVEL_DIFF * 8;
  }

  getMaximumSpeed(): number {
    return MAXIMUM_SPEED / 2;
  }

  getLevelLinesRequired(): number {
    return LEVEL_LINES_DIFF;
  }
}
