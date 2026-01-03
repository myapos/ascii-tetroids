import { describe, it, expect, vi, beforeEach } from "vitest";
import { debounce } from "../debounce";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("should execute the function immediately on first call", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();

    expect(fn).toHaveBeenCalledOnce();
  });

  it("should return true on successful call", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    const result = debounced();

    expect(result).toBe(true);
  });

  it("should return false when called within debounce interval", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced(); // First call - should execute
    const result = debounced(); // Second call within 100ms - should be blocked

    expect(result).toBe(false);
    expect(fn).toHaveBeenCalledOnce();
  });

  it("should allow execution after debounce interval passes", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced(); // First call
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);

    const result = debounced(); // Second call after interval
    expect(result).toBe(true);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should handle multiple calls with proper debouncing", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    // First call
    debounced();
    expect(fn).toHaveBeenCalledTimes(1);

    // Calls within interval - should be blocked
    debounced();
    debounced();
    debounced();
    expect(fn).toHaveBeenCalledTimes(1);

    // Advance time and call again
    vi.advanceTimersByTime(100);
    debounced();
    expect(fn).toHaveBeenCalledTimes(2);

    // More calls within new interval
    debounced();
    debounced();
    expect(fn).toHaveBeenCalledTimes(2);

    // After another interval
    vi.advanceTimersByTime(100);
    debounced();
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("should work with different interval values", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 250);

    debounced();
    expect(fn).toHaveBeenCalledOnce();

    // After 100ms - still blocked
    vi.advanceTimersByTime(100);
    const result1 = debounced();
    expect(result1).toBe(false);
    expect(fn).toHaveBeenCalledTimes(1);

    // After 250ms total - should execute
    vi.advanceTimersByTime(150);
    const result2 = debounced();
    expect(result2).toBe(true);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should create independent debounced instances", () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const debounced1 = debounce(fn1, 100);
    const debounced2 = debounce(fn2, 100);

    debounced1();
    debounced2();
    expect(fn1).toHaveBeenCalledOnce();
    expect(fn2).toHaveBeenCalledOnce();

    // Both should be blocked independently
    const result1 = debounced1();
    const result2 = debounced2();
    expect(result1).toBe(false);
    expect(result2).toBe(false);

    vi.advanceTimersByTime(100);

    // Both should execute after their intervals
    debounced1();
    debounced2();
    expect(fn1).toHaveBeenCalledTimes(2);
    expect(fn2).toHaveBeenCalledTimes(2);
  });
});
