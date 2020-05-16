import { createApplicationStore } from "./store";
import Keyboard from "./keyboard";
import AppMenu from "./app_menu";
import Window from "./window";
import Interface from "./interface";
import Canvas from "./canvas";
import Repl from "./repl";

const store = createApplicationStore();

Window(store);
AppMenu(store);
Keyboard(store);
Canvas(store);
Interface(store);
Repl(store);
