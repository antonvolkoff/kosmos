import { createSelector } from "@reduxjs/toolkit";
import { ApplicationState } from "../store";
import Edge from "./edge";

const getEdges = (state: ApplicationState) => state.default.edges;

export const getAtoms = (state: ApplicationState) => state.default.atoms;

export const getMode = (state: ApplicationState) => state.canvas.mode;

export const getSelectedAtomId = (state: ApplicationState) => state.canvas.selectedAtomId;

export const getSelectedEdgeId = (state: ApplicationState) => state.canvas.selectedEdgeId;

export const getViewField = (state: ApplicationState) => state.canvas.viewField;

export const getTranslateValue = (state: ApplicationState) => state.canvas.translate;

export const getDraftConnection = (state: ApplicationState) => {
  if (state.canvas.draftConnection.show) {
    return state.canvas.draftConnection.line;
  } else {
    return null;
  }
}

export const getDrawableAtoms =
  createSelector([getAtoms, getSelectedAtomId], (atoms, selectedAtomId) => {
    return Object.values(atoms).map(({ id, x, y, value }) => {
      const selected = (id === selectedAtomId);
      return { id, x, y, value, selected };
    });
  });

export const getDrawableEdges =
  createSelector([getAtoms, getEdges, getSelectedEdgeId], (atoms, edges, selectedEdgeId) => {
    return edges.map(({ sourceId, targetId }) => {
      const source = atoms[sourceId];
      const target = atoms[targetId];
      const edgeId = Edge.id({ sourceId, targetId });
      return {
        x1: source.x,
        y1: source.y,
        x2: target.x,
        y2: target.y,
        sourceId,
        targetId,
        selected: (edgeId === selectedEdgeId),
      };
    })
  });

export const getSelectedAtom =
  createSelector([getAtoms, getSelectedAtomId], (atoms, selectedAtomId) => {
    return atoms[selectedAtomId];
  });
