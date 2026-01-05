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
 * Manages mode lifecycle - setup and cleanup of resources
 * Automatically tracks all listeners for guaranteed cleanup
 * Similar to React/Vue onMount/onUnmount lifecycle hooks
 */
export class ModeLifecycle {
  private listeners: ListenerRegistration[] = [];
  private isActive = false;

  constructor(private inputHandler: InputHandler) {}

  /**
   * Register an event listener and track it for automatic cleanup
   */
  registerListener(
    eventType: InputEventType,
    handler: (event: InputEvent) => void
  ): void {
    this.inputHandler.on(eventType, handler);
    this.listeners.push({ eventType, handler });
  }

  /**
   * Activate the lifecycle (onMount)
   */
  activate(): void {
    this.isActive = true;
  }

  /**
   * Clean up all registered listeners (onUnmount)
   * Should be called in finally block to guarantee execution
   */
  cleanup(): void {
    for (const listener of this.listeners) {
      this.inputHandler.off(listener.eventType, listener.handler);
    }
    this.listeners = [];
    this.isActive = false;
  }

  /**
   * Check if lifecycle is currently active
   */
  isRunning(): boolean {
    return this.isActive;
  }

  /**
   * Get number of tracked listeners (for debugging)
   */
  getListenerCount(): number {
    return this.listeners.length;
  }
}
