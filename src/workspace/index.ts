import { parse } from "path";
import { readFileSync, writeFileSync } from "fs";
import { start, send, call } from "../core/actor";
import { pack } from "./json_packer";
import { unpack } from "./clojure_packer";

const initialState = { path: "", filename: "" };

function getState(): any {
  return call("store", "getState").default;
}

function setState(atoms: any[], edges: any[]) {
  const action = { type: "set-atoms-edges", payload: { atoms, edges } };
  send("store", "dispatch", action);
}

function filename(path: string) {
  return parse(path).base;
}

function validPath(path) {
  return typeof path == "string" && path != "";
}

const Workspace = {
  init: () => initialState,
  new() {
    setState([], []);
    return initialState;
  },

  save(state) {
    writeFileSync(state.path, pack(getState()));
    return state;
  },

  saveAs(state, path) {
    if (!validPath(path)) return state;

    writeFileSync(path, pack(getState()));
    return { path, filename: filename(path) };
  },

  open(state, path) {
    if (!validPath(path)) return state;

    const [atoms, edges] = unpack(readFileSync(path).toString());
    setState(atoms, edges);

    return { path, filename: filename(path) };
  },

  hasFile(state) {
    const response = state.path != "";
    return { state, response };
  },
};

start(Workspace, "workspace");
