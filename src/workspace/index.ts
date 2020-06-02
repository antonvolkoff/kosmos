import { parse } from "path";
import { readFileSync, writeFileSync } from "fs";
import { start, send, call } from "../core/actor";
import { unpack, pack } from "./clojure_packer";
import { topLevelAtoms, valueGraphSelector } from "../store/defaultReducer";

const initialState = { path: "", filename: "Untitled" };

function getState(): any {
  return call("store", "getState").default;
}

function setState(atoms: any[], edges: any[]) {
  const action = { type: "set-atoms-edges", payload: { atoms, edges } };
  send("store", "dispatch", action);
}

function getFilename(path: string) {
  return parse(path).base;
}

function validPath(path) {
  return typeof path == "string" && path != "";
}

function changeWindowTitle(filename: string) {
  send("window", "changeTitle", `${filename} - Kosmos`);
}

const Workspace = {
  init: () => initialState,

  new() {
    setState([], []);
    changeWindowTitle(initialState.filename);
    return initialState;
  },

  save(state) {
    const defaultState = getState();
    const nodes = topLevelAtoms(defaultState).map(atom => {
      return valueGraphSelector(defaultState, atom.id);
    });
    writeFileSync(state.path, pack(nodes));
    return state;
  },

  saveAs(state, path) {
    if (!validPath(path)) return state;

    const filename = getFilename(path);
    changeWindowTitle(filename);

    writeFileSync(path, pack(getState()));
    return { path, filename: filename };
  },

  open(state, path) {
    if (!validPath(path)) return state;

    const [atoms, edges] = unpack(readFileSync(path).toString());
    setState(atoms, edges);

    const filename = getFilename(path);
    changeWindowTitle(filename);

    return { path, filename };
  },

  hasFile(state) {
    const response = state.path != "";
    return { state, response };
  },
};

start(Workspace, "workspace");
