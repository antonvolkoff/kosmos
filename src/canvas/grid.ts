import { Point } from "./geometry";

export const gridSize = 20;

export const nearestGridValue = (n: number): number => {
  return Math.round(n / gridSize) * gridSize;
};

export const nearestGridPoint = ({x, y}: Point): Point => {
  return { x: nearestGridValue(x), y: nearestGridValue(y) };
};
