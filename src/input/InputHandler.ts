export type InputEventType =
  | "move-left"
  | "move-right"
  | "move-down"
  | "rotate"
  | "pause"
  | "play-again"
  | "quit"
  | "play"
  | "volume-up"
  | "volume-down"
  | "difficulty-easy"
  | "difficulty-normal"
  | "difficulty-hard";

export interface InputEvent {
  type: InputEventType;
  timestamp: number;
}

import { isWindows } from "src/utils/osDetection";
import { Throttle } from "src/utils/throttle";

export class InputHandler {
  private listeners: Map<InputEventType, Set<(event: InputEvent) => void>> =
    new Map();
  private isListening: boolean = false;
  // Windows-specific: track held keys for smooth continuous movement
  private heldKeys: Set<string> = new Set();
  private lastKeyPressTime: Map<string, number> = new Map();
  private keyRepeatTimeout: NodeJS.Timeout | null = null;
  private heldActionThrottle: Throttle = new Throttle(50); // 50ms throttle for held actions
  private readonly KEY_RELEASE_TIMEOUT_MS = 600; // ms before assuming a key is released (Windows initial repeat delay ~500ms)

  on(eventType: InputEventType, callback: (event: InputEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
  }

  off(eventType: InputEventType, callback: (event: InputEvent) => void) {
    this.listeners.get(eventType)?.delete(callback);
  }

  registerDifficultySelectionHandlers(
    easyCallback: (event: InputEvent) => void,
    normalCallback: (event: InputEvent) => void,
    hardCallback: (event: InputEvent) => void
  ) {
    this.on("difficulty-easy", easyCallback);
    this.on("difficulty-normal", normalCallback);
    this.on("difficulty-hard", hardCallback);
  }

  unregisterDifficultySelectionHandlers(
    easyCallback: (event: InputEvent) => void,
    normalCallback: (event: InputEvent) => void,
    hardCallback: (event: InputEvent) => void
  ) {
    this.off("difficulty-easy", easyCallback);
    this.off("difficulty-normal", normalCallback);
    this.off("difficulty-hard", hardCallback);
  }

  emit(event: InputEvent) {
    const callbacks = this.listeners.get(event.type);
    if (callbacks) {
      callbacks.forEach((callback) => callback(event));
    }
  }

  start() {
    // Prevent registering stdin listener multiple times
    if (this.isListening) {
      return;
    }

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

      if (key === " ") {
        this.emit({ type: "pause", timestamp: Date.now() });
      }

      if (key === "p" || key === "P") {
        this.emit({ type: "play", timestamp: Date.now() });
      }

      if (key === "r" || key === "R") {
        this.emit({ type: "play-again", timestamp: Date.now() });
      }

      // Windows-specific movement handling with held key tracking
      if (isWindows()) {
        if (key === "\u001b[D") {
          this.heldKeys.add("\u001b[D");
          this.lastKeyPressTime.set("\u001b[D", Date.now());
          this.emit({ type: "move-left", timestamp: Date.now() });
        } else if (key === "\u001b[C") {
          this.heldKeys.add("\u001b[C");
          this.lastKeyPressTime.set("\u001b[C", Date.now());
          this.emit({ type: "move-right", timestamp: Date.now() });
        } else if (key === "\u001b[B") {
          this.heldKeys.add("\u001b[B");
          this.lastKeyPressTime.set("\u001b[B", Date.now());
          this.emit({ type: "move-down", timestamp: Date.now() });
        } else if (key === "\u001b[A") {
          this.heldKeys.add("\u001b[A");
          this.lastKeyPressTime.set("\u001b[A", Date.now());
          this.emit({ type: "rotate", timestamp: Date.now() });
        }
      } else {
        // Non-Windows platforms: event-based movement handling
        if (key === "\u001b[D") {
          this.emit({ type: "move-left", timestamp: Date.now() });
        } else if (key === "\u001b[C") {
          this.emit({ type: "move-right", timestamp: Date.now() });
        } else if (key === "\u001b[B") {
          this.emit({ type: "move-down", timestamp: Date.now() });
        } else if (key === "\u001b[A") {
          this.emit({ type: "rotate", timestamp: Date.now() });
        }
      }
      if (key === "+" || key === "=") {
        this.emit({ type: "volume-up", timestamp: Date.now() });
      } else if (key === "-" || key === "_") {
        this.emit({ type: "volume-down", timestamp: Date.now() });
      }
      if (key === "1") {
        this.emit({ type: "difficulty-easy", timestamp: Date.now() });
      } else if (key === "2") {
        this.emit({ type: "difficulty-normal", timestamp: Date.now() });
      } else if (key === "3") {
        this.emit({ type: "difficulty-hard", timestamp: Date.now() });
      }
    });

    this.isListening = true;
  }

  stop() {
    if (this.isListening) {
      process.stdin.removeAllListeners();
      process.stdin.pause();
    }
    if (isWindows()) {
      this.heldKeys.clear();
      this.lastKeyPressTime.clear();
      this.heldActionThrottle.reset();
      if (this.keyRepeatTimeout) {
        clearTimeout(this.keyRepeatTimeout);
      }
    }
  }

  // Windows-only: get held movements for smooth continuous input
  getHeldMovements(): string[] {
    if (!isWindows()) return [];

    const now = Date.now();
    // If no key press detected within KEY_RELEASE_TIMEOUT_MS, assume all keys are released
    if (
      now - Math.max(...Array.from(this.lastKeyPressTime.values()), 0) >
      this.KEY_RELEASE_TIMEOUT_MS
    ) {
      this.heldKeys.clear();
      this.lastKeyPressTime.clear();
      this.heldActionThrottle.reset();
      return [];
    }

    const movements: string[] = [];

    // Use throttle utility to prevent jumpy behavior
    if (
      this.heldKeys.has("\u001b[D") &&
      this.heldActionThrottle.canExecute("<")
    ) {
      movements.push("<");
    }

    if (
      this.heldKeys.has("\u001b[C") &&
      this.heldActionThrottle.canExecute(">")
    ) {
      movements.push(">");
    }

    if (
      this.heldKeys.has("\u001b[B") &&
      this.heldActionThrottle.canExecute("down")
    ) {
      movements.push("down");
    }

    if (
      this.heldKeys.has("\u001b[A") &&
      this.heldActionThrottle.canExecute("rotate")
    ) {
      movements.push("rotate");
    }

    return movements;
  }
}
