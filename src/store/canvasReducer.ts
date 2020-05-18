import { PayloadAction, createSlice, createAction } from "@reduxjs/toolkit";
import * as ViewField from "../canvas/view_field";

interface WindowDimensions {
  width: number;
  height: number;
}

interface Offset {
  deltaX: number;
  deltaY: number;
}

interface Point {
  x: number;
  y: number;
}

export interface CanvasState {
  viewField: ViewField.ViewField;
  translate: Point;
}

const initialState: CanvasState = {
  viewField: ViewField.init(800, 600),
  translate: { x: 0, y: 0 },
};

const canvasSlice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    changeWindowDimensions(state, action: PayloadAction<WindowDimensions>) {
      const { width, height } = action.payload;
      state.viewField = ViewField.resize(state.viewField, width, height);
    },
    moveCanvas(state, action: PayloadAction<Offset>) {
      const { deltaX, deltaY } = action.payload;
      state.viewField = ViewField.move(state.viewField, deltaX, deltaY);
      state.translate = ViewField.translateTo(state.viewField);
    },
    clicked(state, action: PayloadAction<Point>) {
    },
    doubleClicked(state, action: PayloadAction<Point>) {
    },
    mousePressed(state, action: PayloadAction<Point>) {
    },
    mouseReleased(state, action: PayloadAction<Point>) {
    },
  },
});

export const { actions, reducer } = canvasSlice;
export default reducer;
