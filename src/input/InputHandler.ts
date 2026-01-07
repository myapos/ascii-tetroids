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

export class InputHandler {
  private listeners: Map<InputEventType, Set<(event: InputEvent) => void>> =
    new Map();
  private isListening: boolean = false;
  private heldKeys: Set<string> = new Set(); // Track currently held keys
  private lastKeyPressTime: Map<string, number> = new Map(); // Track when each key was last pressed
  private keyRepeatTimeout: NodeJS.Timeout | null = null;

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

      if (key === "\u001b[D") {
        this.heldKeys.add("\u001b[D");
        this.lastKeyPressTime.set("\u001b[D", Date.now());
        this.resetKeyReleaseTimeout();
        this.emit({ type: "move-left", timestamp: Date.now() });
      } else if (key === "\u001b[C") {
        this.heldKeys.add("\u001b[C");
        this.lastKeyPressTime.set("\u001b[C", Date.now());
        this.resetKeyReleaseTimeout();
        this.emit({ type: "move-right", timestamp: Date.now() });
      } else if (key === "\u001b[B") {
        this.heldKeys.add("\u001b[B");
        this.lastKeyPressTime.set("\u001b[B", Date.now());
        this.resetKeyReleaseTimeout();
        this.emit({ type: "move-down", timestamp: Date.now() });
      } else if (key === "\u001b[A") {
        this.emit({ type: "rotate", timestamp: Date.now() });
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
    this.heldKeys.clear();
    this.lastKeyPressTime.clear();
    if (this.keyRepeatTimeout) {
      clearTimeout(this.keyRepeatTimeout);
    }
  }

  getHeldMovements(): string[] {
    const movements: string[] = [];
    if (this.heldKeys.has("\u001b[D")) movements.push("<");
    if (this.heldKeys.has("\u001b[C")) movements.push(">");
    if (this.heldKeys.has("\u001b[B")) movements.push("down");
    return movements;
  }

  private resetKeyReleaseTimeout() {
    if (this.keyRepeatTimeout) {
      clearTimeout(this.keyRepeatTimeout);
    }
    // If no key press detected within 100ms, assume keys are released
    this.keyRepeatTimeout = setTimeout(() => {
      this.heldKeys.clear();
      this.lastKeyPressTime.clear();
    }, 100);
  }
}
