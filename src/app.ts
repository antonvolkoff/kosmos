import Keyboard from "./keyboard";
import AppMenu from "./app_menu";
import Window from "./window";
import Interface from "./interface";
import Canvas from "./canvas";
import { store } from "./store";
import { connectRepl } from "./store/executor";

Window(store);
AppMenu(store);
Keyboard(store);
Canvas(store);
Interface(store);
connectRepl(store);
