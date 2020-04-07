import * as p5 from "p5";
import Atom from "./atom";
import executor from "./executor";
import { Line, distance, pointAt } from "./geometry";

////////////////////////////////////////////////////////////////////////////////

import { createStore, createSlice } from "@reduxjs/toolkit";
import { devToolsEnhancer } from "redux-devtools-extension";

const transcript = createSlice({
  name: "transcript",
  initialState: [],
  reducers: {
    add(state, action) {
      state.push(action.payload);
    },

    clear(state) {
      state = [];
    },
  }
});

const store = createStore(transcript.reducer, devToolsEnhancer({}));
let atoms : Atom[] = [];
let lines: Line[] = [];

////////////////////////////////////////////////////////////////////////////////

import { remote } from "electron";
import { addMenuItem } from "./menu";
const { dialog } = remote;

const menu = remote.Menu.getApplicationMenu();

addMenuItem(menu, "File", {
  label: "Open",
  click() {
    dialog.showOpenDialog({}).then(result => {
      console.log(result.filePaths);
    });
  },
});
addMenuItem(menu, "File", {
  label: "Save",
  click() {
    console.log('Clicked save');
  },
});
addMenuItem(menu, "File", {
  label: "Save As",
  click() {
    dialog.showSaveDialog({}).then(result => {
      console.log(result.filePath);
    });
  },
});

remote.Menu.setApplicationMenu(menu);

////////////////////////////////////////////////////////////////////////////////

interface MousePosition {
  x: number;
  y: number;
}

const ATOM_DIAMETER = 50;

let valueInput: p5.Element = undefined;
let bg: p5.Graphics = null;

const findSelectedAtom = (atoms: Atom[]) => {
  return atoms.find(atom => atom.selected);
}

const findDraggingAtom = (atoms: Atom[]) => {
  return atoms.find(atom => atom.dragging);
};

const findMouseOverAtom = (atoms: Atom[], mouse: MousePosition) => {
  return atoms.find(atom => isWithinAtomBoundaries(mouse, atom));
}

const evaluateAtom = (atom: Atom): void => {
  executor(atom).then((result) => {
    store.dispatch(transcript.actions.add(result));
  });
}

const snapToGrid = (mouse: MousePosition): MousePosition => {
  const gridSize = 20;
  const x = Math.round(mouse.x / gridSize) * gridSize;
  const y = Math.round(mouse.y / gridSize) * gridSize;
  return { x, y };
}

function createAtom({ x, y }: MousePosition) {
  const atom = new Atom(x, y);
  atoms.push(atom);
  selectAtom(atom);
};

function isWithinAtomBoundaries(mouse: MousePosition, atom: Atom): boolean {
  const leftBoundary = atom.x - (ATOM_DIAMETER / 2);
  const rightBoundary = atom.x + (ATOM_DIAMETER / 2);
  const topBoundary = atom.y + (ATOM_DIAMETER / 2);
  const bottomBoundary = atom.y - (ATOM_DIAMETER / 2);

  return (
    mouse.x > leftBoundary &&
    mouse.x < rightBoundary &&
    mouse.y > bottomBoundary &&
    mouse.y < topBoundary
  );
}

function drawAtoms(s: p5) {
  s.push();

  s.strokeWeight(2);
  s.fill(255);

  // Connections
  atoms.forEach(atom => {
    s.stroke(150);

    atom.adjacentAtoms.forEach(childAtom => {
      const d = distance(atom, childAtom);
      const offset = (ATOM_DIAMETER / 2 + 8);
      const r1 = 1 - (offset / d);
      const point = pointAt(atom, childAtom, r1);

      s.line(atom.x, atom.y, point.x, point.y);
      s.push();
      s.circle(point.x, point.y, 10);
      s.pop();
    });
  });

  // Atoms
  atoms.forEach(atom => {
    if (atom.selected) {
      s.strokeWeight(3);
      s.stroke(s.color('#1DA159'));
    } else {
      s.strokeWeight(2);
      s.stroke(150);
    }

    const diameter = atom.dragging ? ATOM_DIAMETER * 1.2 : ATOM_DIAMETER;
    s.circle(atom.x, atom.y, diameter);

    s.push();
    s.fill(50);
    s.strokeWeight(0);
    s.textAlign(s.CENTER, s.CENTER);
    s.textFont("monospace", 14);
    s.text(atom.value, atom.x, atom.y);
    s.pop();
  });

  s.pop();
};

function inputEvent() {
  const atom = findSelectedAtom(atoms);
  atom.value = this.value();
}

function drawBackground(s: p5, bg: p5.Graphics, color: p5.Color) {
  bg.background(color);

  bg.stroke(210);
  bg.strokeWeight(3);

  const spaceBetweenDots = 20;
  const maxColumns = s.windowWidth / 10;
  const maxRows = s.windowHeight / 10;

  for(let c = 0; c < maxColumns; c++) {
    for(let r = 0; r < maxRows; r++) {
      bg.point(spaceBetweenDots * c, spaceBetweenDots * r);
    }
  }

  return bg;
};

function drawFPS(s: p5) {
  const fps = s.frameRate();
  s.textSize(14);
  s.fill(0);
  s.stroke(0);
  s.text("FPS: " + fps.toFixed(2), 10, 20);
};

const selectAtom = (atom: Atom) => {
  if (atom.selected) {
    valueInput.elt.focus();
    valueInput.value(atom.value);
    return
  }

  const selectedAtom = findSelectedAtom(atoms);
  if (selectedAtom) unselectAtom(selectedAtom);

  atom.selected = true;
  valueInput.elt.focus();
  valueInput.value(atom.value);
};

const unselectAtom = (atom: Atom) => {
  atom.selected = false;
  valueInput.value('');
}

const canvasPlaceholder = document.getElementById('canvas');

const sketch = (p: p5) => {
  const HOLD_DURATION = 750;
  const HOLD_DIST_THRESHOLD = 20;

  let timestamp: number = undefined;
  let startPoint: MousePosition = undefined;
  let keepDrawings = false;
  let showFPS = false;

  const backgroundColor = p.color("#FDFDFD");

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    bg = p.createGraphics(p.windowWidth, p.windowHeight);
    bg = drawBackground(p, bg, backgroundColor);

    valueInput = p.createInput();
    valueInput.position(p.width - 200, 65);
    (valueInput as any).input(inputEvent);
  };

  p.draw = () => {
    if (p.mouseIsPressed === true) {
      lines.push({ x1: p.mouseX, y1: p.mouseY, x2: p.pmouseX, y2: p.pmouseY });
    } else {
      if (!keepDrawings) lines = [];
    }

    p.image(bg, 0, 0, p.windowWidth, p.windowHeight);

    p.push();
    p.stroke(150);
    p.strokeWeight(2);
    lines.forEach(l => {
      p.line(l.x1, l.y1, l.x2, l.y2);
    });
    p.pop();

    drawAtoms(p);

    // Hold animation
    if (startPoint) {
      const f = () => {
        const currentPoint: MousePosition = { x: p.mouseX, y: p.mouseY };
        const dist = distance(startPoint, currentPoint);
        if (dist >= HOLD_DIST_THRESHOLD) return;

        const now = new Date().getTime();
        const mousePressedDuration = now - timestamp;
        if (mousePressedDuration < 250) return;

        let angleRad =  p.TWO_PI;

        const r = mousePressedDuration / HOLD_DURATION;
        if (r < 1) {
          angleRad = angleRad * r;
        }

        let radius = 20;
        let { x, y } = startPoint;

        const atom = findMouseOverAtom(atoms, currentPoint);
        if (atom) {
          x = atom.x;
          y = atom.y;
        }

        p.push();
        p.stroke(0, 0, 0, 50);
        p.noFill();
        p.strokeCap(p.PROJECT);
        p.strokeWeight(6);
        p.arc(x, y, radius, radius, 0, angleRad);
        p.pop();
      }
      f();
    }

    if (showFPS) drawFPS(p);
  };

  p.windowResized = () => {
    bg = p.createGraphics(p.windowWidth, p.windowHeight);
    bg = drawBackground(p, bg, backgroundColor);
    p.resizeCanvas(p.windowWidth, p.windowHeight);

    valueInput.position(p.width - 200, 65);
  };

  p.mousePressed = () => {
    timestamp = new Date().getTime();
    startPoint = { x: p.mouseX, y: p.mouseY };
  }

  p.mouseReleased = () => {
    const now = new Date().getTime();
    const mousePressedDuration = now - timestamp;
    const isClickAndHold = mousePressedDuration > HOLD_DURATION;

    const startAtom = findMouseOverAtom(atoms, startPoint);
    const currentPoint: MousePosition = { x: p.mouseX, y: p.mouseY };
    const currentAtom = findMouseOverAtom(atoms, currentPoint);
    const dist = distance(startPoint, currentPoint);
    const selectedAtom = findSelectedAtom(atoms);

    let action: string = "";

    if (startAtom && currentAtom && startAtom != currentAtom) {
      action = "connect";
    }
    else if (isClickAndHold && !startAtom && !currentAtom && dist <= HOLD_DIST_THRESHOLD) {
      action = "create";
    }
    else if (isClickAndHold && startAtom && currentAtom && startAtom == currentAtom && currentAtom.selected) {
      action = "startDrag";
    }
    else if(!isClickAndHold && currentAtom && currentAtom.dragging) {
      action = "finishDrag";
    }
    else if (!isClickAndHold && currentAtom && !currentAtom.dragging) {
      action = "select";
    }
    else if (!isClickAndHold && !currentAtom && selectedAtom) {
      action = "unselect";
    } else {
      action = "draw";
    }

    startPoint = undefined;
    timestamp = undefined;

    switch (action) {
      case "create":
        createAtom(snapToGrid(currentPoint));
        break;

      case "select":
        selectAtom(currentAtom);
        break;

      case "unselect":
        unselectAtom(selectedAtom);
        break;

      case "connect":
        startAtom.connect(currentAtom);
        break;

      case "startDrag":
        currentAtom.dragging = true;
        break;

      case "finishDrag":
        const { x, y } = snapToGrid(currentPoint)
        selectedAtom.x = x;
        selectedAtom.y = y;
        selectedAtom.dragging = false;
        break;

      case "draw":
        // do nothing here yet
        break;

      default:
        break;
    }
  }

  p.mouseMoved = () => {
    const draggingAtom = findDraggingAtom(atoms);
    if (draggingAtom) {
      draggingAtom.x = p.mouseX;
      draggingAtom.y = p.mouseY;
    }
  };

  p.keyReleased = () => {
    const selectedAtom = findSelectedAtom(atoms);

    if (p.key == "d" && !selectedAtom) {
      keepDrawings = !keepDrawings;
    }

    if (p.key == "f" && !selectedAtom) {
      showFPS = !showFPS;
    }

    if (p.keyCode == p.ENTER && selectedAtom) {
      evaluateAtom(selectedAtom);
    }
  }
};

new p5(sketch, canvasPlaceholder);

////////////////////////////////////////////////////////////////////////////////

import { render } from "react-dom";
import { html } from "htm/react";
import Transcript from "./transcript";

render(
  html`<${Transcript} store="${store}" />`,
  document.getElementById('transcript'),
);
