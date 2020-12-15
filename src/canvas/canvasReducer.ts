import { PayloadAction, createSlice, Middleware } from "@reduxjs/toolkit";
import * as ViewField from "./view_field";
import { getSelectedAtomId, getDraftConnection } from "./selectors";
import { addAtom, moveAtom, connectAtoms } from "../store/defaultReducer";
import { createAtom } from "../store/atom";
import { Point, Line } from "./geometry";
import { nearestGridPoint } from "./grid";

interface WindowDimensions {
  width: number;
  height: number;
}

interface Offset {
  deltaX: number;
  deltaY: number;
}

type Mode = "idle" | "ready" | "enter" | "edit";

export interface Click {
  mouse: Point;
  atomId: string;
  dragArea: boolean;
  clickOffset?: Offset;
}

export interface CanvasState {
  viewField: ViewField.ViewField;
  translate: Point;
  mouse: Point;
  pressedAtomId: string;
  selectedAtomId: string;
  draggedAtomId: string;
  clickOffset: Offset;
  selectedEdgeId: string;
  mode: Mode;
  draftConnection: {
    show: boolean;
    line: Line;
  },
}

const initialState: CanvasState = {
  viewField: ViewField.init(800, 600),
  translate: { x: 0, y: 0 },
  mouse: { x: 0, y: 0 },
  pressedAtomId: null,
  draggedAtomId: null,
  selectedAtomId: null,
  clickOffset: { deltaX: 0, deltaY: 0 },
  selectedEdgeId: null,
  mode: "idle",
  draftConnection: {
    show: false,
    line: { x1: 0, y1: 0, x2: 0, y2: 0 },
  },
};

const canvasSlice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    reset(state) {
      state.selectedAtomId = null;
      state.pressedAtomId = null;
      state.draggedAtomId = null;
      state.mode = "idle";
      state.viewField.x = 0;
      state.viewField.y = 0;
      state.translate.x = 0;
      state.translate.y = 0;
    },
    changeWindowDimensions(state, action: PayloadAction<WindowDimensions>) {
      const { width, height } = action.payload;
      state.viewField = ViewField.resize(state.viewField, width, height);
    },
    moveCanvas(state, action: PayloadAction<Offset>) {
      const { deltaX, deltaY } = action.payload;
      state.viewField = ViewField.move(state.viewField, deltaX, deltaY);
      state.translate = ViewField.translateTo(state.viewField);
    },
    clicked(state, action: PayloadAction<Click>) {
      state.mouse = action.payload.mouse;
      state.draggedAtomId = null;
      state.clickOffset = initialState.clickOffset;

      state.draftConnection = initialState.draftConnection;
    },
    doubleClicked(state, action: PayloadAction<Click>) {
      state.mouse = action.payload.mouse;
      state.draggedAtomId = null;
      state.pressedAtomId = null;
    },
    mousePressed(state, { payload }: PayloadAction<Click>) {
      state.mouse = payload.mouse;
      state.pressedAtomId = payload.atomId;
      state.draftConnection.line.x1 = payload.mouse.x;
      state.draftConnection.line.y1 = payload.mouse.y;

      const isStartingToDrag =
        payload.dragArea &&
        payload.atomId === state.selectedAtomId &&
        state.mode === "ready";

      if (isStartingToDrag) {
        state.draggedAtomId = payload.atomId;
        state.clickOffset = payload.clickOffset || initialState.clickOffset;
      }
    },
    mouseDragged(state, action: PayloadAction<Click>) {
      state.mouse = action.payload.mouse;
      if (state.pressedAtomId && !state.draggedAtomId) {
        state.draftConnection.line.x2 = action.payload.mouse.x;
        state.draftConnection.line.y2 = action.payload.mouse.y;
        state.draftConnection.show = true;
      }
    },
    changeMode(state, action: PayloadAction<Mode>) {
      state.mode = action.payload;
    },
    select(state, action: PayloadAction<string>) {
      state.selectedAtomId = action.payload;
      state.selectedEdgeId = null;
      state.mode = "ready";
    },
    unselect(state, action: PayloadAction<void>) {
      state.selectedAtomId = null;
      state.selectedEdgeId = null;
      state.mode = "idle";
    },
    typed(state, action: PayloadAction<void>) {
      if (state.mode === "ready") {
        state.mode = "enter";
      }
    },
    selectEdge(state, action: PayloadAction<string>) {
      state.selectedEdgeId = action.payload;
    },
  },
  extraReducers: {
    "delete-atom": (state) => {
      state.selectedAtomId = null;
    },
  }
});

const doubleClickedMiddleware: Middleware = ({ getState, dispatch }) => {
  const switchToEditMode = () =>
    dispatch(canvasSlice.actions.changeMode("edit"));

  const createNewAtom = (mouse: Point) => {
    const { x, y } = nearestGridPoint(mouse);
    const newAtom = createAtom(x, y);

    dispatch(addAtom(newAtom));
    window.kosmos.api.dispatch(["canvas/add-node", newAtom]);
    dispatch(canvasSlice.actions.select(newAtom.id));
  };

  const clickedOnSelectedAtom = (clickedAtomId: string | null): boolean => {
    const selectedAtomId = getSelectedAtomId(getState());
    return !!clickedAtomId && clickedAtomId === selectedAtomId;
  };

  return next => action => {
    next(action);

    if (canvasSlice.actions.doubleClicked.match(action)) {
      if (clickedOnSelectedAtom(action.payload.atomId)) {
        switchToEditMode();
      } else {
        createNewAtom(action.payload.mouse);
      }
    }
  }
};

const mouseClickedMiddleware: Middleware = ({ dispatch }) => {
  return next => action => {
    next(action);

    if (canvasSlice.actions.clicked.match(action)) {
      if (action.payload.atomId) {
        dispatch(canvasSlice.actions.select(action.payload.atomId));
      } else {
        dispatch(canvasSlice.actions.unselect());
      }
    }
  };
};

const moveDragAtomMiddleware: Middleware = ({ getState, dispatch }) => {
  return next => action => {
    if (canvasSlice.actions.clicked.match(action)) {
      const { draggedAtomId, mouse, clickOffset } = getState().canvas;
      if (draggedAtomId) {
        const { deltaX, deltaY } = clickOffset;
        const { x, y } = nearestGridPoint({
          x: mouse.x + deltaX,
          y: mouse.y + deltaY,
        });
        dispatch(moveAtom(draggedAtomId, x, y));
        window.kosmos.api.dispatch(['canvas/node-moved', [draggedAtomId, x, y]]);
      }
    }

    next(action);

    if (canvasSlice.actions.mouseDragged.match(action)) {
      const { draggedAtomId, mouse, clickOffset } = getState().canvas;
      if (draggedAtomId) {
        const { x, y } = mouse;
        const { deltaX, deltaY } = clickOffset;
        dispatch(moveAtom(draggedAtomId, x + deltaX, y + deltaY));
        window.kosmos.api.dispatch(['canvas/node-moved', [draggedAtomId, x + deltaX, y + deltaY]]);
      }
    }
  };
};

const connectAtomsMiddleware: Middleware = ({ getState, dispatch }) => {
  return next => action => {
    const shouldConnect = (
      canvasSlice.actions.clicked.match(action) &&
      getDraftConnection(getState()) &&
      action.payload.atomId
    );

    if (shouldConnect) {
      const sourceId = getState().canvas.pressedAtomId;
      const targetId = action.payload.atomId;
      if (sourceId !== targetId) {
        dispatch(connectAtoms(sourceId, targetId));
        window.kosmos.api.dispatch(["canvas/connect-nodes", [sourceId, targetId]]);
      }
    }

    next(action);
  }
};

export const middlewares = [
  doubleClickedMiddleware,
  mouseClickedMiddleware,
  moveDragAtomMiddleware,
  connectAtomsMiddleware,
];

export const { actions, reducer } = canvasSlice;
export default reducer;
