/**
 * Throttle utility for rate-limiting action execution
 * Useful for handling repeated input events with a minimum time between executions
 */

export class Throttle {
  private lastExecutionTime: Map<string, number> = new Map();
  private readonly throttleMs: number;

  constructor(throttleMs: number = 50) {
    this.throttleMs = throttleMs;
  }

  /**
   * Check if an action should execute based on throttle time
   * @param actionKey Unique identifier for the action being throttled
   * @returns true if enough time has passed since last execution, false otherwise
   */
  canExecute(actionKey: string): boolean {
    const now = Date.now();
    const lastTime = this.lastExecutionTime.get(actionKey) ?? 0;

    if (now - lastTime >= this.throttleMs) {
      this.lastExecutionTime.set(actionKey, now);
      return true;
    }

    return false;
  }

  /**
   * Reset throttle for a specific action
   */
  reset(actionKey?: string): void {
    if (actionKey) {
      this.lastExecutionTime.delete(actionKey);
    } else {
      this.lastExecutionTime.clear();
    }
  }

  /**
   * Check if any actions have been tracked
   */
  isEmpty(): boolean {
    return this.lastExecutionTime.size === 0;
  }
}
