import * as p5 from "p5";
import Atom from "./atom";
import executor from "./executor";

interface MousePosition {
  x: number;
  y: number;
}

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const ATOM_DIAMETER = 50;

let valueInput: p5.Element = undefined;
let connectButton: p5.Element = undefined;
let evalButton: p5.Element = undefined;
let bg: p5.Graphics = null;

let atoms : Atom[] = [];
let lines : Line[] = [];
let evalResult = "";

const selectedAtom = (): Atom | undefined => {
  return atoms.find(atom => atom.selected);
}

const hasSelectedAtom = (): boolean => {
  return (selectedAtom() == undefined) ? false : true;
};

const findDraggingAtom = (atoms: Atom[]) => {
  return atoms.find(atom => atom.dragging);
};

const findMouseOverAtom = (atoms: Atom[], mouse: MousePosition) => {
  return atoms.find(atom => isWithinAtomBoundaries(mouse, atom));
}

function createAtom(mouse: MousePosition) {
  const atom = new Atom(mouse.x, mouse.y);
  atoms.push(atom);

  if (hasSelectedAtom()) {
    selectedAtom().selected = false;
    valueInput.value('');
  }

  atom.selected = true;
  valueInput.value(atom.value);
  valueInput.elt.focus();
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

function selectAtom(mouse: MousePosition) {
  for (let i = 0; i < atoms.length; i++) {
    const atom = atoms[i];

    if (isWithinAtomBoundaries(mouse, atom)) {
      atom.selected = !atom.selected;
      if (atom.selected) {
        valueInput.value(atom.value);
        valueInput.elt.focus();
      } else {
        valueInput.value('');
      }

      return
    }
  }
}

function drawAtoms(s: p5) {
  s.push();

  s.strokeWeight(5);
  s.stroke(190);

  atoms.forEach(atom => {
    if (atom.selected) {
      s.fill(255, 255, 0);
    } else {
      s.fill(255);
    }

    s.circle(atom.x, atom.y, ATOM_DIAMETER);

    s.push();
    s.fill(50);
    s.strokeWeight(0);
    s.textAlign(s.CENTER, s.CENTER);
    s.text(atom.value, atom.x, atom.y);
    s.pop();
  });

  s.pop();
};

function drawLines(s: p5) {
  s.push();

  s.strokeWeight(5);
  s.stroke(190);

  atoms.forEach(atom => {
    atom.adjacentAtoms.forEach(childAtom => {
      s.line(atom.x, atom.y, childAtom.x, childAtom.y);
    });
  });

  s.pop();
}

function inputEvent() {
  const atom = selectedAtom();
  atom.value = this.value();
}

function connectAtoms() {
  const selectedAtoms = atoms.filter(atom => atom.selected);
  if (selectedAtoms.length != 2) return;

  lines.push({
    x1: selectedAtoms[0].x,
    y1: selectedAtoms[0].y,
    x2: selectedAtoms[1].x,
    y2: selectedAtoms[1].y,
  });

  selectedAtoms[0].connect(selectedAtoms[1]);
  selectedAtoms[1].connect(selectedAtoms[0]);
}

function evalAtom() {
  evalResult = executor(selectedAtom());
}

function drawResult(s: p5) {
  s.push();

  s.textSize(14);
  s.stroke(0);
  s.strokeWeight(0);
  s.text(evalResult, s.width / 2, 20);

  s.pop();
}

function drawBackground(bg: p5.Graphics, s: p5) {
  bg.background(244, 248, 252);

  bg.stroke(190);
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
  s.text("FPS: " + fps.toFixed(2), 10, s.height - 10);
};

const sketch = (p: p5) => {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    bg = drawBackground(p.createGraphics(p.windowWidth, p.windowHeight), p);

    valueInput = p.createInput();
    valueInput.position(p.width - 200, 65);
    (valueInput as any).input(inputEvent);

    connectButton = p.createButton("Connect");
    connectButton.position(p.width - 200, 100);
    connectButton.mousePressed(connectAtoms);

    evalButton = p.createButton("Eval");
    evalButton.position(p.width - 200, 135);
    evalButton.mousePressed(evalAtom);
  };

  p.draw = () => {
    p.image(bg, 0, 0, p.windowWidth, p.windowHeight);
    drawLines(p);
    drawAtoms(p);
    drawResult(p);
    drawFPS(p);
  };

  p.windowResized = () => {
    bg = drawBackground(p.createGraphics(p.windowWidth, p.windowHeight), p);
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.doubleClicked = () => {
    createAtom({ x: p.mouseX, y: p.mouseY });
  };

  p.mouseClicked = () => {
    const draggingAtom = findDraggingAtom(atoms);
    if (draggingAtom) {
      draggingAtom.dragging = false;
      draggingAtom.x = p.mouseX;
      draggingAtom.y = p.mouseY;
    } else {
      selectAtom({ x: p.mouseX, y: p.mouseY });
    }
  };

  p.mouseDragged = () => {
    const draggingAtom = findDraggingAtom(atoms);
    if (draggingAtom) {
      draggingAtom.x = p.mouseX;
      draggingAtom.y = p.mouseY;
      return
    };

    const movedX = Math.abs(p.pmouseX - p.mouseX);
    const movedY = Math.abs(p.pmouseY - p.mouseY);
    if (movedX < 2 || movedY < 2) return;

    const overAtom = findMouseOverAtom(atoms, { x: p.pmouseX, y: p.mouseY });
    if (overAtom) {
      overAtom.dragging = true;
    }
  }
};

new p5(sketch);
