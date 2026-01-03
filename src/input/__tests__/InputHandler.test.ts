import { describe, it, expect, beforeEach, vi } from "vitest";
import { InputHandler, type InputEventType } from "src/input/InputHandler";

describe("InputHandler", () => {
  let inputHandler: InputHandler;

  beforeEach(() => {
    inputHandler = new InputHandler();
  });

  describe("event listener registration", () => {
    it("registers a listener for an event type", () => {
      const callback = vi.fn();

      inputHandler.on("move-left", callback);

      // Verify listener is registered by emitting and checking callback
      inputHandler.emit({ type: "move-left", timestamp: Date.now() });

      expect(callback).toHaveBeenCalled();
    });

    it("registers multiple listeners for same event type", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      inputHandler.on("move-left", callback1);
      inputHandler.on("move-left", callback2);

      inputHandler.emit({ type: "move-left", timestamp: Date.now() });

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it("supports all event types", () => {
      const eventTypes: InputEventType[] = [
        "move-left",
        "move-right",
        "move-down",
        "rotate",
        "pause",
        "play-again",
        "quit",
        "play",
      ];

      eventTypes.forEach((eventType) => {
        const callback = vi.fn();
        inputHandler.on(eventType, callback);

        inputHandler.emit({ type: eventType, timestamp: Date.now() });

        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({ type: eventType })
        );
      });
    });
  });

  describe("event listener removal", () => {
    it("removes a registered listener", () => {
      const callback = vi.fn();

      inputHandler.on("move-left", callback);
      inputHandler.off("move-left", callback);

      inputHandler.emit({ type: "move-left", timestamp: Date.now() });

      expect(callback).not.toHaveBeenCalled();
    });

    it("only removes specified callback, keeps others", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      inputHandler.on("move-left", callback1);
      inputHandler.on("move-left", callback2);
      inputHandler.off("move-left", callback1);

      inputHandler.emit({ type: "move-left", timestamp: Date.now() });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it("handles removal of non-existent listener gracefully", () => {
      const callback = vi.fn();
      const otherCallback = vi.fn();

      inputHandler.on("move-left", callback);
      inputHandler.off("move-left", otherCallback);

      inputHandler.emit({ type: "move-left", timestamp: Date.now() });

      expect(callback).toHaveBeenCalled();
    });
  });

  describe("event emission", () => {
    it("emits event with correct type and timestamp", () => {
      const callback = vi.fn();
      const timestamp = Date.now();

      inputHandler.on("move-left", callback);
      inputHandler.emit({ type: "move-left", timestamp });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "move-left",
          timestamp,
        })
      );
    });

    it("emits to multiple listeners in sequence", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      inputHandler.on("rotate", callback1);
      inputHandler.on("rotate", callback2);
      inputHandler.on("rotate", callback3);

      inputHandler.emit({ type: "rotate", timestamp: Date.now() });

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      expect(callback3).toHaveBeenCalled();
    });

    it("does not emit to unregistered event types", () => {
      const callback = vi.fn();

      inputHandler.on("move-left", callback);
      inputHandler.emit({ type: "move-right", timestamp: Date.now() });

      expect(callback).not.toHaveBeenCalled();
    });

    it("does not emit if no listeners registered for event type", () => {
      const callback = vi.fn();

      inputHandler.on("move-left", callback);

      // Emit for different event type with no listeners - should not crash
      expect(() => {
        inputHandler.emit({ type: "pause", timestamp: Date.now() });
      }).not.toThrow();

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("event listener independence", () => {
    it("isolates listeners by event type", () => {
      const moveLeftCallback = vi.fn();
      const moveRightCallback = vi.fn();

      inputHandler.on("move-left", moveLeftCallback);
      inputHandler.on("move-right", moveRightCallback);

      inputHandler.emit({ type: "move-left", timestamp: Date.now() });

      expect(moveLeftCallback).toHaveBeenCalled();
      expect(moveRightCallback).not.toHaveBeenCalled();
    });

    it("allows same callback on different event types", () => {
      const callback = vi.fn();

      inputHandler.on("move-left", callback);
      inputHandler.on("move-right", callback);

      inputHandler.emit({ type: "move-left", timestamp: Date.now() });
      inputHandler.emit({ type: "move-right", timestamp: Date.now() });

      expect(callback).toHaveBeenCalledTimes(2);
    });
  });
});
