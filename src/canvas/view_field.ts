import { Point } from "./geometry";

export interface ViewField {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const surfaceWidth = 8192;
export const surfaceHeight = 8192;

export const init =
  (width: number, height: number): ViewField => {
    return { x: 0, y: 0, width, height };
  };

export const resize =
  ({ x, y }: ViewField, width: number, height: number): ViewField => {
    return { x, y, width, height };
  };

const limitMove =
  (move: number, screenSize: number, limit: number): number => {
    if (move < 0) return 0;
    return move + screenSize > limit ? limit - screenSize : move;
  };

export const move =
  (vf: ViewField, deltaX: number, deltaY: number): ViewField => {
    const { x, y, width, height } = vf;

    const newX = limitMove(x + deltaX, width, surfaceWidth);
    const newY = limitMove(y + deltaY, height, surfaceHeight);

    return { x: newX, y: newY, width, height };
  };

export const translateTo =
  (view: ViewField): Point => ({ x: -view.x, y: -view.y });

export const toGlobalCoordinates =
  (view: ViewField, point: Point): Point => {
    return { x: point.x + view.x, y: point.y + view.y };
  };

export const toLocalCoordinates =
  (view: ViewField, point: Point): Point => {
    return { x: point.x - view.x, y: point.y - view.y };
  };
