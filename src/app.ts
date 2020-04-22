import * as p5 from "p5";
import { remote, ipcRenderer } from "electron";
import { render } from "react-dom";
import { html } from "htm/react";

import Atom from "./atom";
import { Line, Point, distance, pointAt } from "./geometry";
import Transcript from "./components/transcript";
import Control from "./components/control";
import State from "./state/state";

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

  function handleMouseEvent(name: string) {
    const currentPoint: Point = { x: p.mouseX, y: p.mouseY };
    const startAtom = findMouseOverAtom(State.atoms(), startPoint);
    const currentAtom = findMouseOverAtom(State.atoms(), currentPoint);

    switch (name) {
      case "startDrag":
        startAtom.dragging = true;
        startAtom.selected = true;
        break;

      case "finishDrag":
        const draggingAtom = State.findDraggingAtom();

        const { x, y } = snapToGrid(currentPoint);
        draggingAtom.x = x;
        draggingAtom.y = y;
        draggingAtom.dragging = false;
        focusInput(draggingAtom);
        break;

      case "create":
        createAtom(snapToGrid(currentPoint));
        break;

      case "select":
        selectAtom(currentAtom);
        break;

      case "unselect":
        unselectAtom(State.findSelectedAtom());
        break;

      case "connect":
        State.connectAtoms(startAtom, currentAtom);
        break;

      case "draw":
        // Do nothing
        break;

      default:
        break;
    }
  }

  function drawEdges() {
    p.push();

    p.strokeWeight(1);
    p.stroke(150);

    State.edges().forEach(edge => {
      p.line(edge.x1, edge.y1, edge.x2, edge.y2);
    });

    p.pop();
  }

  function drawAtoms() {
    p.push();

    // Atoms
    State.atoms().forEach(atom => {
      AtomShape.draw(p, atom);
    });

    p.pop();
  }

  function drawHoldAnimation() {
    if (!startPoint) return;

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

    drawEdges();
    drawAtoms();

    // Hold animation
    drawHoldAnimation();

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

    const startAtom = findMouseOverAtom(State.atoms(), startPoint);
    if (startAtom && AtomShape.withinDragArea(startPoint, startAtom)) {
      handleMouseEvent("startDrag");
    }
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
    const draggingAtom = State.findDraggingAtom();

    if (draggingAtom) {
      handleMouseEvent("finishDrag");
    } else if (startAtom && currentAtom && startAtom != currentAtom) {
      handleMouseEvent("connect");
    } else if (isClickAndHold && !startAtom && !currentAtom && dist <= HOLD_DIST_THRESHOLD) {
      handleMouseEvent("create");
    } else if (!isClickAndHold && currentAtom && !currentAtom.dragging) {
      handleMouseEvent("select");
    } else if (!isClickAndHold && !currentAtom && selectedAtom) {
      handleMouseEvent("unselect");
    } else {
      handleMouseEvent("draw");
    }

    startPoint = undefined;
    timestamp = undefined;
  }

  p.mouseMoved = () => {
  }

  p.mouseDragged = () => {
    const draggingAtom = State.findDraggingAtom();
    if (draggingAtom) {
      draggingAtom.x = p.mouseX;
      draggingAtom.y = p.mouseY;
    }
  }

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
