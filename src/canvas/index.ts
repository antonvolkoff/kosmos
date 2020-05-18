import * as p5 from "p5";
import { Store } from "redux";
import Sketch from "./sketch";

export default function Canvas(store: Store) {
  const sketch = new p5(Sketch(store), document.getElementById("canvas"));

  store.subscribe(() => {
    sketch.redraw();
  });
}