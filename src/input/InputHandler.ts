export type InputEventType =
  | "move-left"
  | "move-right"
  | "move-down"
  | "rotate"
  | "pause"
  | "play-again"
  | "quit";

export interface InputEvent {
  type: InputEventType;
  timestamp: number;
}

export class InputHandler {
  private listeners: Map<InputEventType, Set<(event: InputEvent) => void>> =
    new Map();
  private isListening: boolean = false;

  on(eventType: InputEventType, callback: (event: InputEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
  }

  off(eventType: InputEventType, callback: (event: InputEvent) => void) {
    this.listeners.get(eventType)?.delete(callback);
  }

  private emit(event: InputEvent) {
    const callbacks = this.listeners.get(event.type);
    if (callbacks) {
      callbacks.forEach((callback) => callback(event));
    }
  }

  start() {
    const isInDebugMode = typeof process.stdin.setRawMode === "undefined";

    if (isInDebugMode) {
      return;
    }

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (key) => {
      if (key === "\u0003") {
        // Ctrl+C
        this.emit({ type: "quit", timestamp: Date.now() });
        process.exit();
      }

      if (key === "q" || key === "Q") {
        this.emit({ type: "quit", timestamp: Date.now() });
      }

      if (key === "p" || key === "P" || key === " ") {
        this.emit({ type: "pause", timestamp: Date.now() });
      }

      if (key === "r" || key === "R") {
        this.emit({ type: "play-again", timestamp: Date.now() });
      }

      if (key === "\u001b[D") {
        this.emit({ type: "move-left", timestamp: Date.now() });
      } else if (key === "\u001b[C") {
        this.emit({ type: "move-right", timestamp: Date.now() });
      } else if (key === "\u001b[B") {
        this.emit({ type: "move-down", timestamp: Date.now() });
      } else if (key === "\u001b[A") {
        this.emit({ type: "rotate", timestamp: Date.now() });
      }
    });

    this.isListening = true;
  }

  stop() {
    if (this.isListening) {
      process.stdin.removeAllListeners();
      process.stdin.pause();
    }
  }
}
