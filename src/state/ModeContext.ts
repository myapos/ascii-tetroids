import type { InputHandler } from "src/input/InputHandler";
import type { InputEventType, InputEvent } from "src/input/InputHandler";

/**
 * Tracks a single listener registration for cleanup
 */
export interface ListenerRegistration {
  eventType: InputEventType;
  handler: (event: InputEvent) => void;
}

/**
 * Manages mode-specific state and resources
 * Automatically tracks all listeners and resources for cleanup
 */
export class ModeContext {
  private listeners: ListenerRegistration[] = [];
  private isActive = false;

  constructor(private inputHandler: InputHandler) {}

  /**
   * Register an event listener and track it for cleanup
   */
  registerListener(
    eventType: InputEventType,
    handler: (event: InputEvent) => void
  ): void {
    this.inputHandler.on(eventType, handler);
    this.listeners.push({ eventType, handler });
  }

  /**
   * Clean up all registered listeners
   */
  cleanup(): void {
    for (const listener of this.listeners) {
      this.inputHandler.off(listener.eventType, listener.handler);
    }
    this.listeners = [];
    this.isActive = false;
  }

  /**
   * Mark context as active
   */
  activate(): void {
    this.isActive = true;
  }

  /**
   * Check if context is active
   */
  active(): boolean {
    return this.isActive;
  }

  /**
   * Get number of tracked listeners (for debugging)
   */
  getListenerCount(): number {
    return this.listeners.length;
  }
}
