import { createAction, createReducer } from "@reduxjs/toolkit";

const prepareCoords = (x: number, y: number) => ({ payload: { x, y } });

export const canvasClicked =
  createAction("canvas/clicked", prepareCoords);

export const canvasDoubleClicked =
  createAction("canvas/doubleClicked", prepareCoords);

export const canvasMousePressed =
  createAction("canvas/mousePressed", prepareCoords);

export const canvasMouseReleased =
  createAction("canvas/mouseReleased", prepareCoords);
