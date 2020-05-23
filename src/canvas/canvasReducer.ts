import { PayloadAction, createSlice, Middleware } from "@reduxjs/toolkit";
import * as ViewField from "./view_field";
import { getSelectedAtomId, getViewField, getAtoms, getDraftConnection } from "./selectors";
import { addAtom, moveAtom, connectAtoms } from "../store/defaultReducer";
import { createAtom } from "../store/atom";
import { Point, Line } from "./geometry";
import AtomShape from "./atom_shape";
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
    mousePressed(state, action: PayloadAction<Click>) {
      state.mouse = action.payload.mouse;
      state.pressedAtomId = action.payload.atomId;
      state.draftConnection.line.x1 = action.payload.mouse.x;
      state.draftConnection.line.y1 = action.payload.mouse.y;

      const isStartingToDrag =
        action.payload.dragArea &&
        action.payload.atomId == state.selectedAtomId &&
        state.mode == "ready";

      if (isStartingToDrag) {
        state.draggedAtomId = action.payload.atomId;
        state.clickOffset = action.payload.clickOffset || initialState.clickOffset;
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
      state.mode = "ready";
    },
    unselect(state, action: PayloadAction<void>) {
      state.selectedAtomId = null;
      state.mode = "idle";
    },
    typed(state, action: PayloadAction<void>) {
      if (state.mode == "ready") {
        state.mode = "enter";
      }
    },
  },
  extraReducers: {
    "delete-atom": (state) => {
      state.selectedAtomId = null;
    },
  }
});

const convertToGlobalCoordsMiddleware: Middleware = ({ getState }) => {
  const types = [
    canvasSlice.actions.doubleClicked.type,
    canvasSlice.actions.clicked.type,
    canvasSlice.actions.mousePressed.type,
    canvasSlice.actions.clicked.type,
    canvasSlice.actions.mouseDragged.type,
  ];

  return next => action => {
    if (types.includes(action.type)) {
      action.payload.mouse = ViewField.toGlobalCoordinates(
        getViewField(getState()),
        action.payload.mouse,
      );
    }

    next(action);
  }
};

const detectMouseLocationMiddleware: Middleware = ({getState}) => {
  const types = [
    canvasSlice.actions.doubleClicked.type,
    canvasSlice.actions.clicked.type,
    canvasSlice.actions.mousePressed.type,
    canvasSlice.actions.clicked.type,
    canvasSlice.actions.mouseDragged.type,
  ];

  return next => action => {
    if (types.includes(action.type)) {
      const atoms = getAtoms(getState());
      const mouse = action.payload.mouse;
      const atom = Object.values(atoms).find((atom) => AtomShape.within(mouse, atom));
      if (atom) {
        action.payload.atomId = atom.id;
        action.payload.dragArea = AtomShape.withinDragArea(mouse, atom);
        action.payload.clickOffset = {
          deltaX: atom.x - mouse.x,
          deltaY: atom.y - mouse.y,
        };
      } else {
        action.payload.atomId = null;
        action.payload.dragArea = false;
      }
    }

    next(action);
  }
};

const doubleClickedMiddleware: Middleware = ({ getState, dispatch }) => {
  return next => action => {
    next(action);

    if (canvasSlice.actions.doubleClicked.match(action)) {
      if (action.payload.atomId && action.payload.atomId == getSelectedAtomId(getState())) {
        dispatch(canvasSlice.actions.changeMode("edit"));
      } else {
        const { x, y } = nearestGridPoint(action.payload.mouse);
        const newAtom = createAtom(x, y);

        dispatch(addAtom(newAtom));
        dispatch(canvasSlice.actions.select(newAtom.id));
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
        const { x, y } = nearestGridPoint({ x: mouse.x + deltaX, y: mouse.y + deltaY });
        dispatch(moveAtom(draggedAtomId, x, y));
      }
    }

    next(action);

    if (canvasSlice.actions.mouseDragged.match(action)) {
      const { draggedAtomId, mouse, clickOffset } = getState().canvas;
      if (draggedAtomId) {
        const { x, y } = mouse;
        const { deltaX, deltaY } = clickOffset;
        dispatch(moveAtom(draggedAtomId, x + deltaX, y + deltaY));
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
      dispatch(connectAtoms(sourceId, targetId));
    }

    next(action);
  }
};

export const middlewares = [
  convertToGlobalCoordsMiddleware,
  detectMouseLocationMiddleware,
  doubleClickedMiddleware,
  mouseClickedMiddleware,
  moveDragAtomMiddleware,
  connectAtomsMiddleware,
];

export const { actions, reducer } = canvasSlice;
export default reducer;
