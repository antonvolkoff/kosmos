import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { createStore, Reducer } from "redux";
import produce from "immer";
import { devToolsEnhancer } from "redux-devtools-extension";
import * as pathUtil from "path";
import * as fs from "fs";

import { Atom } from "./atom";
import AtomShape from "../canvas/atom_shape";
import { nearestGridPoint } from "../canvas/grid";
import { Line } from "../canvas/geometry";
import * as JsonPacker from "./json_packer";
import * as Executor from "../repl";
import * as ClojurePacker  from "./clojure_packer";

import * as actions from "./actions";
export { actions };

export interface ApplicationState {
  atoms: { [id: string]: Atom };
  edges: { sourceId: string, targetId: string }[];
  [key: string]: any;
}

const initialState = {
  atoms: {},
  edges: [],
  connectedToRepl: false,
  selectedAtomId: null,
  draggingAtomId: null,
  entries: [],
  canvasTranslate: { x: 0, y: 0 },
  hasFile: false,
  file: { filename: "Untitled", path: "", }
};

const createReducer = (initialState, actions): Reducer => {
  return (state = initialState, action) => {
    const handler = actions[action.type];
    if (!handler) return state;

    return produce(state, draftState => handler(draftState, action));
  };
};

const reducer = createReducer(initialState, {
  "select-atom": (state, action) => {
    state.selectedAtomId = action.payload.atomId;
  },
  "unselect-atom": (state) => {
    state.selectedAtomId = null;
  },
  "delete-atom": (state, action) => {
    const { atomId } = action.payload;

    if (state.selectedAtomId == atomId) {
      state.selectedAtomId = null;
    }

    delete state.atoms[atomId];

    state.edges = state.edges.filter(({ sourceId, targetId }) => {
      const isSource = sourceId == atomId;
      const isTarget = targetId == atomId;
      return !isSource && !isTarget;
    });
  },
  "add-atom": (state, action) => {
    state.atoms[action.payload.id] = action.payload;
  },
  "connected-to-repl": (state) => {
    state.connectedToRepl = true;
  },
  "connect-atoms": (state, action) => {
    const { sourceId, targetId } = action.payload;
    state.edges.push({ sourceId, targetId });
  },
  "start-drag": (state, action) => {
    state.draggingAtomId = action.payload.atomId;
  },
  "finish-drag": (state) => {
    state.draggingAtomId = null;
  },
  "move-atom": (state, action) => {
    const doMove = (atomId: string, deltaX: number, deltaY: number) => {
      let moveAtom = state.atoms[atomId];

      moveAtom.x += deltaX;
      moveAtom.y += deltaY;

      childrenSelector(state, moveAtom.id)
        .map(({ id }) => id)
        .forEach(id => doMove(id, deltaX, deltaY));
    }

    const { atomId, x, y } = action.payload;
    let rootAtom = state.atoms[atomId];
    const deltaX = x - rootAtom.x;
    const deltaY = y - rootAtom.y;

    doMove(atomId, deltaX, deltaY);
  },
  "set-atom-value": (state, action) => {
    const adjustDistance = (atom: Atom) => {
      const standardAtomOffset = 40;
      const width = AtomShape.width(atom) + standardAtomOffset;

      childrenSelector(state, atom.id).forEach(childAtom => {
        const { x, y } = nearestGridPoint({ x: atom.x + width, y: childAtom.y });
        childAtom.x = x;
        childAtom.y = y;
        adjustDistance(childAtom);
      });
    }

    const { atomId, value } = action.payload;
    const atom = state.atoms[atomId];
    atom.value = value;
    adjustDistance(atom);
  },
  "create-new-file": (state) => {
    state.atoms = {};
    state.edges = [];
    state.file.filename = 'Untitled';
    state.hasFile = false;
    state.selectedAtomId = null;
    state.draggingAtomId = null;
    state.canvasTranslate = { x: 0, y: 0 };
  },
  "open-file": (state, action) => {
    const { path } = action.payload;
    state.file.path = path;
    state.file.filename = pathUtil.parse(path).base;

    const rawJson = fs.readFileSync(path);
    const [atoms, edges] = JsonPacker.unpack(rawJson.toString());
    state.atoms = atoms;
    state.edges = edges;

    state.hasFile = true;
  },
  "save-file": (state) => {
    const rawJson = JsonPacker.pack(state);
    fs.writeFileSync(state.file.path, rawJson);
  },
  "save-file-as": (state, action) => {
    const { path } = action.payload;
    state.file.path = path;
    state.file.filename = pathUtil.parse(path).base;

    const rawJson = JsonPacker.pack(state);
    fs.writeFileSync(state.file.path, rawJson);
  },
  "add-evaluation-entry": (state, action) => {
    state.entries.push(action.payload);
  },
  "export-to-file": (state, action) => {
    const { path } = action.payload;
    const data = ClojurePacker.pack(
      topLevelAtoms(state).map(atom => valueGraphSelector(state, atom.id))
    );

    fs.writeFileSync(path, data);
  },
  "move-canvas": (state, action) => {
    state.canvasTranslate = action.payload;
  },
});

const evaluateMiddleware = ({ dispatch, getState }) => next => action => {
  next(action);

  if (action.type == "eval-selected-atom") {
    const state = getState();
    const node = valueGraphSelector(state, state.selectedAtomId);

    Executor.execute(ClojurePacker.pack([node])).then(result => {
      dispatch({ type: "add-evaluation-entry", payload: result });
    });
  }
};

export const createApplicationStore = () => {
  return configureStore({
    reducer: reducer,
    middleware: [...getDefaultMiddleware(), evaluateMiddleware],
  });
};

////////////////////////////////////////////////////////////////////////////////

const score = ({ x, y }) => x * y;

const sortByScore = (a: Atom, b: Atom) => score(a) - score(b);

export const childrenSelector = (state: ApplicationState, atomId: string): Atom[] => {
  return state.edges
    .filter(({ sourceId }) => sourceId == atomId)
    .map(({ targetId }) => state.atoms[targetId])
    .sort(sortByScore);
}

export const deepChildrenSelector =
  (state: ApplicationState, atomId: string): Atom[] => {
    let children = []

    childrenSelector(state, atomId).forEach(child => {
      children.push(child);
      children = children.concat(deepChildrenSelector(state, child.id));
    })
    return children.sort(sortByScore);
  };

export const parentSelector = (state: ApplicationState, atomId: string): Atom | null => {
  const parentAtomId = state.edges.find(({ targetId }) => targetId == atomId).sourceId;
  return state.atoms[parentAtomId];
};

export const topLevelAtoms = (state: ApplicationState): Atom[] => {
  return Object.keys(state.atoms)
    .filter(atomId => parentSelector(state, atomId) == null)
    .map(atomId => state.atoms[atomId]);
};

export interface ValueNode {
  value: string;
  children: ValueNode[];
}

export const valueGraphSelector =
  (state: ApplicationState, atomId: string): ValueNode => {
    const { id, value } = state.atoms[atomId];
    const children = childrenSelector(state, id).map(atom => {
      return valueGraphSelector(state, atom.id)
    });
    return { value, children };
  };

export const selectedAtomSelector = (store) => {
  const state = store.getState();
  return state.atoms[state.selectedAtomId];
};

export const draggingAtomSelector = (store) => {
  const state = store.getState();
  return state.atoms[state.draggingAtomId];
};

export const edgesSelector = (store): Line[] => {
  const state = store.getState();
  return state.edges.map(({ sourceId, targetId }) => {
    const source = state.atoms[sourceId];
    const target = state.atoms[targetId];
    return { x1: source.x, y1: source.y, x2: target.x, y2: target.y };
  });
};

export const atomsSelector = (store): Atom[] => {
  return Object.values(store.getState().atoms);
};

////////////////////////////////////////////////////////////////////////////////

export const selectAtom =
  (atomId: string) => ({ type: "select-atom", payload: { atomId } });

export const unselectAtom =
  () => ({ type: "unselect-atom" });

export const addAtom =
  (atom) => ({ type: "add-atom", payload: atom });

export const deleteAtom =
  (atomId) => ({ type: "delete-atom", payload: { atomId } });

export const connectedToRepl =
  () => ({ type: "connected-to-repl" });

export const connectAtoms =
  (sourceId, targetId) => ({ type: "connect-atoms", payload: { sourceId, targetId } });

export const startDrag =
  (atomId) => ({ type: "start-drag", payload: { atomId } });

export const finishDrag =
  () => ({ type: "finish-drag" });

export const moveAtom =
  (atomId, x, y) => ({ type: "move-atom", payload: { atomId, x, y } });

export const setAtomValue =
  (atomId: string, value: string) => {
    return { type: "set-atom-value", payload: { atomId, value } };
  }

export const createNewFile =
  () => ({ type: "create-new-file" });

export const openFile =
  (path: string) => ({ type: "open-file", payload: { path } });

export const saveFile =
  () => ({ type: "save-file" });

export const saveFileAs =
  (path: string) => ({ type: "save-file-as", payload: { path } });

export const evalSelectedAtom =
  () => ({ type: "eval-selected-atom" });

export const exportToFile =
  (path: string) => ({ type: "export-to-file", payload: { path } });

export const moveCanvas =
  (x: number, y: number) => ({ type: "move-canvas", payload: { x, y } });
