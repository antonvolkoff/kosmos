import * as p5 from "p5";

import Sketch from "./sketch";
import { State } from "../state";

export default function Canvas(state: State) {
  new p5(Sketch(state), document.getElementById("canvas"));
}