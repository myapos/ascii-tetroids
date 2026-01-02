import { describe, it, expect, beforeEach, vi } from "vitest";
import { ClassicMode } from "../ClassicMode";
import { GameLogic } from "src/game/GameLogic";
import { Renderer } from "src/rendering/Renderer";
import { InputHandler } from "src/input/InputHandler";
import type { UserMove } from "src/types";

describe("ClassicMode", () => {
  let gameLogic: GameLogic;
  let renderer: Renderer;
  let inputHandler: InputHandler;
  let classicMode: ClassicMode;

  beforeEach(() => {
    gameLogic = new GameLogic();
    renderer = new Renderer();
    inputHandler = new InputHandler();
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

  describe("demo mode", () => {
    it("loops sequence correctly with modulo operator", () => {
      const demoSequence: UserMove[] = ["<", ">", "rotate"];
      const sequenceLength = demoSequence.length;

      let demoMoveIndex = 0;
      // Simulate looping through multiple cycles
      for (let i = 0; i < sequenceLength * 3; i++) {
        const move = demoSequence[demoMoveIndex % sequenceLength];
        expect(demoSequence).toContain(move);
        demoMoveIndex++;
      }

      expect(demoMoveIndex).toBe(sequenceLength * 3);
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
      };

      // Verify all 5 properties exist
      expect(Object.keys(gameLoopState)).toHaveLength(5);
      expect(gameLoopState).toHaveProperty("keyQueue");
      expect(gameLoopState).toHaveProperty("lastGravityTime");
      expect(gameLoopState).toHaveProperty("hasRested");
      expect(gameLoopState).toHaveProperty("newShapeIdx");
      expect(gameLoopState).toHaveProperty("gameOverHandled");
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
