import * as p5 from "p5";
import State from "../state/state";

const UNSELECTED = "Press & Hold to create an atom";
const SELECTED = "Type to set value; Press & Hold to drag; Press Enter to evaluate";
const DRAGGING = "Click to release; Press Backspace to delete"

export default {
  draw(p: p5) {
    let content = "";

    if (State.findDraggingAtom()) {
      content = DRAGGING;
    } else if (State.findSelectedAtom()) {
      content = SELECTED;
    } else {
      content = UNSELECTED;
    }

    p.push();
    {
      p.fill(50);
      p.strokeWeight(0);
      p.textAlign(p.LEFT, p.CENTER);
      p.textFont("monospace", 13);
      p.text(content, 20, p.height - 20);
    }
    p.pop();
  },
};
