import * as p5 from "p5";

import Sketch from "./sketch";
import { State } from "../state";

export default function Canvas(state: State) {
  const canvasPlaceholder = document.getElementById("canvas");
  new p5(Sketch, canvasPlaceholder);
}