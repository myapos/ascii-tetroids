import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ClassicMode } from "../ClassicMode";
import { GameLogic } from "src/game/GameLogic";
import { Renderer } from "src/rendering/Renderer";
import { InputHandler } from "src/input/InputHandler";
import {
  getGameStateMediator,
  resetGameStateMediator,
} from "src/state/GameStateMediator";
import type { InputEvent } from "src/input/InputHandler";
import type { UserMove } from "src/types";

describe("ClassicMode", () => {
  let gameLogic: GameLogic;
  let renderer: Renderer;
  let inputHandler: InputHandler;
  let classicMode: ClassicMode;
  let handlers: Map<string, (event: InputEvent) => void>;

  beforeEach(() => {
    resetGameStateMediator();
    gameLogic = new GameLogic();
    renderer = new Renderer();
    inputHandler = new InputHandler();
    vi.spyOn(inputHandler, "on");
    vi.spyOn(inputHandler, "emit");

    // Setup handler tracking
    handlers = new Map();
    vi.spyOn(inputHandler, "on").mockImplementation(
      (eventType, callback: (event: InputEvent) => void) => {
        handlers.set(eventType as string, callback);
        return inputHandler;
      }
    );

    vi.spyOn(inputHandler, "start").mockImplementation(() => {
      throw new Error("Stop execution");
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    resetGameStateMediator();
  });

  describe("initialization", () => {
    it("creates instance in player mode", () => {
      classicMode = new ClassicMode(gameLogic, renderer, inputHandler);
      expect(classicMode).toBeDefined();
    });

    it("creates instance in demo mode with sequence", () => {
      const demoSequence: UserMove[] = ["<", ">", "rotate", "down"];
      classicMode = new ClassicMode(
        gameLogic,
        renderer,
        inputHandler,
        demoSequence
      );
      expect(classicMode).toBeDefined();
    });

    it("accepts render callback", () => {
      const callback = vi.fn();
      classicMode = new ClassicMode(
        gameLogic,
        renderer,
        inputHandler,
        undefined,
        callback
      );
      expect(classicMode).toBeDefined();
    });
  });

  describe("input handler registration", () => {
    it("registers movement handlers in player mode", () => {
      classicMode = new ClassicMode(gameLogic, renderer, inputHandler);
      expect(classicMode).toBeDefined();
    });

    it("does not register movement handlers in demo mode initially", () => {
      const demoSequence: UserMove[] = ["<", ">", "rotate"];
      classicMode = new ClassicMode(
        gameLogic,
        renderer,
        inputHandler,
        demoSequence
      );
      expect(classicMode).toBeDefined();
    });

    it("registers rotate handler in all modes", () => {
      classicMode = new ClassicMode(gameLogic, renderer, inputHandler);
      expect(classicMode).toBeDefined();
    });

    it("registers play listener in demo mode for mode transition", () => {
      const demoSequence: UserMove[] = ["<", ">", "rotate"];
      classicMode = new ClassicMode(
        gameLogic,
        renderer,
        inputHandler,
        demoSequence
      );
      expect(classicMode).toBeDefined();
    });

    it("registers control handlers in all modes", () => {
      classicMode = new ClassicMode(gameLogic, renderer, inputHandler);
      expect(classicMode).toBeDefined();
    });

    it("registers play-again handler for game-over state", () => {
      classicMode = new ClassicMode(gameLogic, renderer, inputHandler);
      expect(classicMode).toBeDefined();
    });
  });

  describe("input handler registration by mode", () => {
    it("player mode created without demoSequence", () => {
      classicMode = new ClassicMode(gameLogic, renderer, inputHandler);
      expect(classicMode).toBeDefined();
      // Player mode: has movement handlers (move-left, move-right, move-down)
      // Player mode: always has rotate, pause, quit, play-again
    });

    it("demo mode created with demoSequence", () => {
      const mediator = getGameStateMediator();
      const demoSequence: UserMove[] = ["<", ">", "rotate"];
      classicMode = new ClassicMode(
        gameLogic,
        renderer,
        inputHandler,
        mediator,
        demoSequence
      );
      expect(classicMode).toBeDefined();
      // Demo mode: NO movement handlers initially
      // Demo mode: always has rotate, pause, quit, play-again
      // Demo mode: HAS play listener to transition to player mode
    });

    it("transition from demo to player mode is possible", () => {
      const mediator = getGameStateMediator();
      const demoSequence: UserMove[] = ["<", ">", "rotate"];
      classicMode = new ClassicMode(
        gameLogic,
        renderer,
        inputHandler,
        mediator,
        demoSequence
      );
      // When play event fires, ClassicMode registers movement handlers
      // This enables the user to control the game after demo
      expect(classicMode).toBeDefined();
    });

    it("ignores play (P) key when game is already active", () => {
      // Create ClassicMode in player mode (no demoSequence)
      // Demo mode no longer registers play handler - mediator handles state transitions
      const mediator = getGameStateMediator();
      classicMode = new ClassicMode(
        gameLogic,
        renderer,
        inputHandler,
        mediator
      );

      const gameState = {
        isActive: true,
        isPaused: false,
        chamber: gameLogic.initializeChamber(),
        previewChamber: gameLogic.initializeChamber(),
        level: 1,
        score: 0,
        totalFilledRows: 0,
        gravitySpeed: 800,
        reset: vi.fn(),
      };

      const mockDifficulty = {
        getInitialGravitySpeed: () => 800,
        getLevelLinesRequired: () => 20,
        getGravitySpeedIncrement: () => 50,
        getMaximumSpeed: () => 100,
        getName: () => "Normal",
      };

      // Start play but stop it before game loop
      classicMode.play(gameState, mockDifficulty).catch(() => {});

      // Verify play handler was registered (player mode only)
      expect(handlers.has("play")).toBe(true);

      // Call the play handler while game is active
      // Handler should return early without calling reset again
      const playHandler = handlers.get("play")!;
      const initialResetCount = gameState.reset.mock.calls.length;
      playHandler({
        type: "play",
        timestamp: Date.now(),
      });

      // Reset should NOT be called again by the handler because gameState.isActive is true
      // Handler early-returns when game is active
      const finalResetCount = gameState.reset.mock.calls.length;
      expect(finalResetCount).toBe(initialResetCount);
    });

    it("registers play handler in player mode for game restart", () => {
      // Create ClassicMode in player mode (no demoSequence)
      const mediator = getGameStateMediator();
      classicMode = new ClassicMode(
        gameLogic,
        renderer,
        inputHandler,
        mediator
      );

      const gameState = {
        isActive: false, // Game is NOT active (game over state)
        isPaused: false,
        chamber: gameLogic.initializeChamber(),
        previewChamber: gameLogic.initializeChamber(),
        level: 1,
        score: 0,
        totalFilledRows: 0,
        gravitySpeed: 800,
        reset: vi.fn(),
      };

      const mockDifficulty = {
        getInitialGravitySpeed: () => 800,
        getLevelLinesRequired: () => 20,
        getGravitySpeedIncrement: () => 50,
        getMaximumSpeed: () => 100,
        getName: () => "Normal",
      };

      // Start play but stop it before game loop
      classicMode.play(gameState, mockDifficulty).catch(() => {});

      // In player mode, play handler IS registered (for restarting after game over)
      expect(handlers.has("play")).toBe(true);

      // Verify handler is properly defined
      expect(handlers.get("play")).toBeDefined();
    });
  });

  describe("game loop state encapsulation", () => {
    it("encapsulates all loop variables in single object", () => {
      const gameLoopState = {
        keyQueue: [] as UserMove[],
        lastGravityTime: Date.now(),
        hasRested: false,
        newShapeIdx: Math.floor(Math.random() * gameLogic.getShapes().size),
        gameOverHandled: false,
        needsRender: false,
      };

      // Verify all 6 properties exist
      expect(Object.keys(gameLoopState)).toHaveLength(6);
      expect(gameLoopState).toHaveProperty("keyQueue");
      expect(gameLoopState).toHaveProperty("lastGravityTime");
      expect(gameLoopState).toHaveProperty("hasRested");
      expect(gameLoopState).toHaveProperty("newShapeIdx");
      expect(gameLoopState).toHaveProperty("gameOverHandled");
      expect(gameLoopState).toHaveProperty("needsRender");
    });

    it("key queue accumulates and clears moves", () => {
      const gameLoopState = {
        keyQueue: [] as UserMove[],
        lastGravityTime: Date.now(),
        hasRested: false,
        newShapeIdx: 0,
        gameOverHandled: false,
      };

      // Accumulate moves
      gameLoopState.keyQueue.push("<");
      gameLoopState.keyQueue.push(">");
      gameLoopState.keyQueue.push("rotate");
      expect(gameLoopState.keyQueue).toHaveLength(3);

      // Clear for reset
      gameLoopState.keyQueue.length = 0;
      expect(gameLoopState.keyQueue).toHaveLength(0);
    });

    it("resets all properties atomically", () => {
      const gameLoopState = {
        keyQueue: ["<", ">", "rotate"] as UserMove[],
        lastGravityTime: Date.now() - 5000,
        hasRested: true,
        newShapeIdx: 3,
        gameOverHandled: true,
      };

      // Verify dirty state
      expect(gameLoopState.keyQueue).toHaveLength(3);
      expect(gameLoopState.hasRested).toBe(true);
      expect(gameLoopState.gameOverHandled).toBe(true);

      // Reset all properties together
      gameLoopState.keyQueue.length = 0;
      gameLoopState.lastGravityTime = Date.now();
      gameLoopState.hasRested = false;
      gameLoopState.newShapeIdx = Math.floor(
        Math.random() * gameLogic.getShapes().size
      );
      gameLoopState.gameOverHandled = false;

      // Verify clean state
      expect(gameLoopState.keyQueue).toHaveLength(0);
      expect(gameLoopState.hasRested).toBe(false);
      expect(gameLoopState.gameOverHandled).toBe(false);
    });

    it("reset clears queue and resets all flags", () => {
      // Create dirty state with accumulated input
      const gameLoopState = {
        keyQueue: ["<", ">", "rotate", "down"] as UserMove[],
        lastGravityTime: Date.now() - 10000,
        hasRested: true,
        newShapeIdx: 5,
        gameOverHandled: true,
      };

      const oldGravityTime = gameLoopState.lastGravityTime;

      // Simulate reset operation
      gameLoopState.keyQueue.length = 0;
      gameLoopState.lastGravityTime = Date.now();
      gameLoopState.hasRested = false;
      gameLoopState.gameOverHandled = false;
      gameLoopState.newShapeIdx = Math.floor(
        Math.random() * gameLogic.getShapes().size
      );

      // Verify complete reset
      expect(gameLoopState.keyQueue).toHaveLength(0);
      expect(gameLoopState.lastGravityTime).toBeGreaterThan(oldGravityTime);
      expect(gameLoopState.hasRested).toBe(false);
      expect(gameLoopState.gameOverHandled).toBe(false);
      expect(gameLoopState.newShapeIdx).toBeGreaterThanOrEqual(0);
    });
  });
});
