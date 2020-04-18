import * as p5 from "p5";
import { remote, ipcRenderer } from "electron";
import { render } from "react-dom";
import { html } from "htm/react";

import Atom from "./atom";
import { Line, Point, distance, pointAt } from "./geometry";
import Transcript from "./components/transcript";
import Control from "./components/control";
import State from "./state";

import AtomShape from "./shapes/atom_shape";
import LegendShape from "./shapes/legend_shape";

////////////////////////////////////////////////////////////////////////////////

const { dialog } = remote;

ipcRenderer.on('click-new', () => {
  State.newFile();
});
ipcRenderer.on('click-open', () => {
  dialog.showOpenDialog({}).then(result => {
    State.openFile(result.filePaths[0]);
  });
});
ipcRenderer.on('click-save', () => {
  if (State.hasFile()) {
    State.saveFile();
  } else {
    dialog.showSaveDialog({}).then(result => {
      State.saveAsFile(result.filePath);
    });
  }
})
ipcRenderer.on('click-save-as', () => {
  dialog.showSaveDialog({}).then(result => {
    State.saveAsFile(result.filePath);
  });
});
ipcRenderer.on("click-export", () => {
  dialog.showSaveDialog({}).then(result => {
    State.exportAsClojure(result.filePath);
  });
});

State.subscribe(() => {
  document.title = `${State.file().name} - Kosmos`;
});

////////////////////////////////////////////////////////////////////////////////

let valueInput: p5.Element = undefined;
let bg: p5.Graphics = null;

const findMouseOverAtom = (atoms: Atom[], mouse: Point) => {
  return atoms.find(atom => AtomShape.within(mouse, atom));
}

const snapToGrid = (mouse: Point): Point => {
  const gridSize = 20;
  const x = Math.round(mouse.x / gridSize) * gridSize;
  const y = Math.round(mouse.y / gridSize) * gridSize;
  return { x, y };
}

function createAtom({ x, y }: Point) {
  const atom = new Atom(x, y);
  State.addAtom(atom);
  selectAtom(atom);
};

function drawAtoms(s: p5) {
  s.push();

  s.strokeWeight(1);
  s.fill(255);

  // Connections
  State.atoms().forEach(atom => {
    s.stroke(150);

    atom.outgoing.forEach(childAtom => {
      const point = pointAt(atom, childAtom, 0.75);

      s.line(atom.x, atom.y, childAtom.x, childAtom.y);
      s.circle(point.x, point.y, 16);

      const a: Point = { x: atom.x, y: atom.y };
      const b: Point = { x: childAtom.x, y: childAtom.y };
      const c: Point = { x: atom.x, y: childAtom.y };
      const ab = distance(a, b);
      const bc = distance(b, c);
      const sinX = bc / ab;
      let angleRad = Math.asin(sinX) - s.HALF_PI;

      if (childAtom.y > atom.y) {
        angleRad = -angleRad;
      }
      if (childAtom.x < atom.x) {
        angleRad = s.HALF_PI + (s.HALF_PI - angleRad);
      }

      s.push();
      s.fill(150);
      s.strokeWeight(0);

      s.translate(point.x, point.y);
      s.rotate(angleRad);

      s.triangle(5, 0, -3, -4, -3, 4);

      s.pop();
    });
  });

  // Atoms
  State.atoms().forEach(atom => {
    AtomShape.draw(s, atom);
  });

  s.pop();
};

function inputEvent() {
  const atom = State.findSelectedAtom();
  atom.value = this.value();
}

function focusInput(atom: Atom) {
  valueInput.elt.focus();
  valueInput.value(atom.value);
}

function blurInput() {
  valueInput.elt.blur();
  valueInput.value('');
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
    focusInput(atom);
    return
  }

  const selectedAtom = State.findSelectedAtom();
  if (selectedAtom) unselectAtom(selectedAtom);

  State.selectAtom(atom);
  focusInput(atom);
};

const unselectAtom = (atom: Atom) => {
  State.unselectAtom(atom);
  blurInput();
}

const canvasPlaceholder = document.getElementById('canvas');

const sketch = (p: p5) => {
  const HOLD_DURATION = 750;
  const HOLD_DIST_THRESHOLD = 20;

  let timestamp: number = undefined;
  let startPoint: Point = undefined;
  let keepDrawings = false;
  let showFPS = false;
  let lines: Line[] = [];

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
        const currentPoint: Point = { x: p.mouseX, y: p.mouseY };
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

        const atom = findMouseOverAtom(State.atoms(), currentPoint);
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

    LegendShape.draw(p);

    if (showFPS) drawFPS(p);
  };

  p.windowResized = () => {
    bg = p.createGraphics(p.windowWidth, p.windowHeight);
    bg = drawBackground(p, bg, backgroundColor);
    p.resizeCanvas(p.windowWidth, p.windowHeight);

    valueInput.position(p.width - 200, 65);
  };

  p.mousePressed = (event: MouseEvent) => {
    if ((event.srcElement as HTMLElement).tagName !== "CANVAS") return;

    timestamp = new Date().getTime();
    startPoint = { x: p.mouseX, y: p.mouseY };
  }

  p.mouseReleased = (event: MouseEvent) => {
    if ((event.srcElement as HTMLElement).tagName !== "CANVAS") return;

    const now = new Date().getTime();
    const mousePressedDuration = now - timestamp;
    const isClickAndHold = mousePressedDuration > HOLD_DURATION;

    const startAtom = findMouseOverAtom(State.atoms(), startPoint);
    const currentPoint: Point = { x: p.mouseX, y: p.mouseY };
    const currentAtom = findMouseOverAtom(State.atoms(), currentPoint);
    const dist = distance(startPoint, currentPoint);
    const selectedAtom = State.findSelectedAtom();

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
        State.connectAtoms(startAtom, currentAtom);
        break;

      case "startDrag":
        currentAtom.dragging = true;
        break;

      case "finishDrag":
        const { x, y } = snapToGrid(currentPoint)
        selectedAtom.x = x;
        selectedAtom.y = y;
        selectedAtom.dragging = false;
        focusInput(selectedAtom);
        break;

      case "draw":
        // do nothing here yet
        break;

      default:
        break;
    }
  }

  p.mouseMoved = () => {
    const draggingAtom = State.findDraggingAtom();
    if (draggingAtom) {
      draggingAtom.x = p.mouseX;
      draggingAtom.y = p.mouseY;
    }
  };

  p.keyReleased = () => {
    const selectedAtom = State.findSelectedAtom();

    if (p.key == "d" && !selectedAtom) {
      keepDrawings = !keepDrawings;
    }

    if (p.key == "f" && !selectedAtom) {
      showFPS = !showFPS;
    }

    if (p.keyCode == p.ENTER && selectedAtom) {
      State.evalAtom(selectedAtom);
    }

    if (p.keyCode == p.BACKSPACE && selectedAtom && selectedAtom.dragging) {
      State.deleteAtom(selectedAtom);
    }
  }
};

new p5(sketch, canvasPlaceholder);

////////////////////////////////////////////////////////////////////////////////

render(
  html`<${Transcript} state="${State}" />`,
  document.getElementById('transcript'),
);

render(
  html`<${Control} state=${State} />`,
  document.getElementById('control'),
);
