import Atom from "./atom";

export interface Point {
  x: number;
  y: number;
}

export interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function atomToPoint(atom: Atom): Point {
  const { x, y } = atom;
  return { x, y };
};

export function buildLineFromAtoms(p1: Point, p2: Point): Line {
  return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
};

export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(
    Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2)
  );
}

export function pointAt(p1: Point, p2: Point, r: number): Point {
  const x = r * p2.x + (1 - r) * p1.x;
  const y = r * p2.y + (1 - r) * p1.y;

  return { x, y };
}

export function midPoint(line: Line): Point {
  const { x1, y1, x2, y2 } = line;
  const midRatio = 0.5;

  const x3 = midRatio * x2 + (1 - midRatio) * x1;
  const y3 = midRatio * y2 + (1 - midRatio) * y1;

  return { x: x3, y: y3 };
}