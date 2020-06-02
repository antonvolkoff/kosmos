import { createApplicationStore } from "./store";
import Keyboard from "./keyboard";
import AppMenu from "./app_menu";
import Interface from "./interface";
import Canvas from "./canvas";
import Repl from "./repl";
import "./workspace";
import "./window";
import { start } from "./core/actor";

const store = createApplicationStore();

const StoreBehavior = {
  init() {
    return null;
  },
  dispatch: (state, action) => {
    store.dispatch(action);
    return state;
  },
  getState: (state) => ({ state, response: store.getState() }),
};
start(StoreBehavior, "store");

AppMenu(store);
Keyboard(store);
Canvas(store);
Interface(store);
Repl(store);
