import * as p5 from "p5";
import { Store } from "@reduxjs/toolkit";

import Sketch from "./sketch";
import { ApplicationState } from "../store";
import { reducer, actions, middlewares } from "./canvasReducer";
import * as selectors from "./selectors";

export default function Canvas(store: Store<ApplicationState>) {
  new p5(Sketch(store), document.getElementById("canvas"));
}

export { reducer, actions, middlewares, selectors };
