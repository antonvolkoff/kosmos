import { Point } from "./geometry";

export const gridSize = 20;

export const nearestGridValue = (n: number): number => {
  return Math.round(n / gridSize) * gridSize;
};

export const nearestGridPoint = ({x, y}: Point): Point => {
  return { x: nearestGridValue(x), y: nearestGridValue(y) };
};

export const gridPoints = (width: number, height: number): Point[] => {
  const maxColumns = width / gridSize;
  const maxRows = height / gridSize;

  let points: Point[] = [];

  for(let c = 0; c < maxColumns; c++) {
    for(let r = 0; r < maxRows; r++) {
      points.push({ x: gridSize * c, y: gridSize * r });
    }
  }

  return points;
};
