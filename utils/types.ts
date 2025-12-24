export interface Pos {
  x: number;
  y: number;
}

export type Direction = "^" | ">" | "v" | "<";

export type Vector = Pos;

export type Graph<T = string> = Map<string, T[]>;

export interface Interval {
  from: number;
  to: number;
}
