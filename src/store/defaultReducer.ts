import { createReducer } from "@reduxjs/toolkit";
import { nearestGridPoint } from "../canvas/grid";
import { Atom } from "./atom";
import AtomShape from "../canvas/atom_shape";
import { Line } from "../canvas/geometry";
import { ApplicationState } from ".";
import { EvalResult } from "../repl";

export interface DefaultState {
  atoms: { [id: string]: Atom };
  edges: { sourceId: string, targetId: string }[];
  entries: EvalResult[];
  [key: string]: any;
}

export interface ValueNode {
  value: string;
  depth: number;
  children: ValueNode[];
}

export const addAtom =
  (atom) => ({ type: "add-atom", payload: atom });

export const deleteAtom =
  (atomId) => ({ type: "delete-atom", payload: { atomId } });

export const connectedToRepl =
  () => ({ type: "connected-to-repl" });

export const connectAtoms =
  (sourceId, targetId) => ({ type: "connect-atoms", payload: { sourceId, targetId } });

export const moveAtom =
  (atomId, x, y) => ({ type: "move-atom", payload: { atomId, x, y } });

export const setAtomValue =
  (atomId: string, value: string) => {
    return { type: "set-atom-value", payload: { atomId, value } };
  }

export const evalSelectedAtom =
  () => ({ type: "eval-selected-atom" });

const initialState: DefaultState = {
  atoms: {},
  edges: [],
  connectedToRepl: false,
  entries: [],
};

const reducer = createReducer(initialState, {
  "set-atoms-edges": (state, action) => {
    state.atoms = action.payload.atoms;
    state.edges = action.payload.edges;
  },
  "delete-atom": (state, action) => {
    const { atomId } = action.payload;

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
  "add-evaluation-entry": (state, action) => {
    state.entries.push(action.payload);
  },
});

const score = ({ x, y }) => x * y;

const sortByScore = (a: Atom, b: Atom) => score(a) - score(b);

export const childrenSelector = (state: DefaultState, atomId: string): Atom[] => {
  return state.edges
    .filter(({ sourceId }) => sourceId == atomId)
    .map(({ targetId }) => state.atoms[targetId])
    .sort(sortByScore);
}

export const deepChildrenSelector =
  (state: DefaultState, atomId: string): Atom[] => {
    let children = []

    childrenSelector(state, atomId).forEach(child => {
      children.push(child);
      children = children.concat(deepChildrenSelector(state, child.id));
    })
    return children.sort(sortByScore);
  };

export const parentSelector = (state: DefaultState, atomId: string): Atom | null => {
  const edge = state.edges.find(({ targetId }) => targetId == atomId);
  if (!edge) return null;

  return state.atoms[edge.sourceId];
};

export const topLevelAtoms = (state: DefaultState): Atom[] => {
  return Object.keys(state.atoms)
    .filter(atomId => parentSelector(state, atomId) == null)
    .map(atomId => state.atoms[atomId])
    .sort(sortByScore);
};

export const draggingAtomSelector = (state: DefaultState) => {
  return state.atoms[state.default.draggingAtomId];
};

export const edgesSelector = (state: DefaultState): Line[] => {
  return state.edges.map(({ sourceId, targetId }) => {
    const source = state.atoms[sourceId];
    const target = state.atoms[targetId];
    return { x1: source.x, y1: source.y, x2: target.x, y2: target.y };
  });
};

export const atomsSelector = (state: DefaultState): Atom[] => {
  return Object.values(state.atoms);
};

export const valueGraphSelector =
  (state: DefaultState, atomId: string, depth: number = 0): ValueNode => {
    const { id, value } = state.atoms[atomId];
    const children = childrenSelector(state, id).map(atom => {
      return valueGraphSelector(state, atom.id, depth + 1);
    });
    return { value, depth, children };
  };

export const getEntries = (state: ApplicationState) => state.default.entries;

export default reducer;
