import { describe, it, expect } from "bun:test";
import dijkstra from "../dijkstra";

describe("dijkstra", () => {
  it("should find the shortest path in a simple graph", () => {
    const graph = {
      A: { B: 1, C: 4 },
      B: { A: 1, C: 2, D: 5 },
      C: { A: 4, B: 2, D: 1 },
      D: { B: 5, C: 1 },
    };
    const result = dijkstra(graph, "A", "D");
    expect(result).toEqual({ distance: 4, path: ["A", "B", "C", "D"] });
  });

  it("should return the start node if start and end are the same", () => {
    const graph = {
      A: { B: 1, C: 4 },
      B: { A: 1, C: 2, D: 5 },
      C: { A: 4, B: 2, D: 1 },
      D: { B: 5, C: 1 },
    };
    const result = dijkstra(graph, "A", "A");
    expect(result).toEqual({ distance: 0, path: ["A"] });
  });

  it("should handle a graph with no path between nodes", () => {
    const graph = {
      A: { B: 1 },
      B: { A: 1 },
      C: { D: 1 },
      D: { C: 1 },
    };
    const result = dijkstra(graph, "A", "D");
    expect(result).toEqual({ distance: Infinity, path: ["D"] });
  });

  it("should handle a larger graph", () => {
    const graph = {
      A: { B: 1, C: 4, E: 7 },
      B: { A: 1, C: 2, D: 5 },
      C: { A: 4, B: 2, D: 1, E: 3 },
      D: { B: 5, C: 1, E: 2 },
      E: { A: 7, C: 3, D: 2 },
    };
    const result = dijkstra(graph, "A", "D");
    expect(result).toEqual({ distance: 4, path: ["A", "B", "C", "D"] });
  });
});
