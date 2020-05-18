import * as p5 from "p5";
import { Store } from "@reduxjs/toolkit";
import Sketch from "./sketch";
import { ApplicationState } from "../store";

export default function Canvas(store: Store<ApplicationState>) {
  const sketch = new p5(Sketch(store), document.getElementById("canvas"));

  store.subscribe(() => {
    sketch.redraw();
  });
}