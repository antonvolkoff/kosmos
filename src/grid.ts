import { Point, Rect } from "./geometry";
import { ViewField } from "./view_field";

export const gridSize = 20;

export const nearestGridValue = (n: number): number => {
  return Math.round(n / gridSize) * gridSize;
};

export const nearestGridPoint = ({x, y}: Point): Point => {
  return { x: nearestGridValue(x), y: nearestGridValue(y) };
};

export const gridPoints = (width: number, height: number): Point[] => {
  const maxColumns = width / gridSize + 1;
  const maxRows = height / gridSize + 1;

  let points: Point[] = [];

  for(let c = 0; c < maxColumns; c++) {
    for(let r = 0; r < maxRows; r++) {
      points.push({ x: gridSize * c, y: gridSize * r });
    }
  }

  return points;
};

export const gridTiles =
  (view: ViewField, tileWidth: number, tileHeight: number): Rect[] => {
    const totalWidth = view.x + view.width;
    const totalHeight = view.y + view.height;
    const cols = Math.ceil(totalWidth / tileWidth);
    const rows = Math.ceil(totalHeight / tileHeight);

    let result: Rect[] = [];
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        result.push({
          x: c * tileWidth,
          y: r * tileHeight,
          width: tileWidth,
          height: tileHeight,
        });
      }
    }

    return result;
  };
