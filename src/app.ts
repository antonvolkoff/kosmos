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
let evalButton: p5.Element = undefined;
let bg: p5.Graphics = null;

let atoms : Atom[] = [];
let lines: Line[] = [];
let evalResult = "";

const findSelectedAtom = (atoms: Atom[]) => {
  return atoms.find(atom => atom.selected);
}

const findDraggingAtom = (atoms: Atom[]) => {
  return atoms.find(atom => atom.dragging);
};

const findMouseOverAtom = (atoms: Atom[], mouse: MousePosition) => {
  return atoms.find(atom => isWithinAtomBoundaries(mouse, atom));
}

function createAtom(mouse: MousePosition) {
  const atom = new Atom(mouse.x, mouse.y);
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

  s.strokeWeight(3);
  s.fill(255);

  atoms.forEach(atom => {
    s.stroke(150);

    atom.adjacentAtoms.forEach(childAtom => {
      s.line(atom.x, atom.y, childAtom.x, childAtom.y);
    });

    if (atom.selected) {
      s.stroke(s.color('#1DA159'));
    } else {
      s.stroke(150);
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

function inputEvent() {
  const atom = findSelectedAtom(atoms);
  atom.value = this.value();
}

function evalAtom() {
  evalResult = executor(findSelectedAtom(atoms));
}

function drawResult(s: p5) {
  s.push();

  s.textSize(14);
  s.stroke(0);
  s.strokeWeight(0);
  s.text(evalResult, s.width / 2, 20);

  s.pop();
}

function drawBackground(s: p5, bg: p5.Graphics, color: p5.Color) {
  bg.background(color);

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

const sketch = (p: p5) => {
  const backgroundColor = p.color('#F2F7FC');

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    bg = p.createGraphics(p.windowWidth, p.windowHeight);
    bg = drawBackground(p, bg, backgroundColor);

    valueInput = p.createInput();
    valueInput.position(p.width - 200, 65);
    (valueInput as any).input(inputEvent);

    evalButton = p.createButton("Eval");
    evalButton.position(p.width - 200, 135);
    evalButton.mousePressed(evalAtom);
  };

  p.draw = () => {
    if (p.mouseIsPressed === true) {
      lines.push({ x1: p.mouseX, y1: p.mouseY, x2: p.pmouseX, y2: p.pmouseY });
    } else {
      lines = [];
    }

    p.image(bg, 0, 0, p.windowWidth, p.windowHeight);

    p.push();
    p.stroke(0, 0, 0, 50);
    p.strokeWeight(3);
    lines.forEach(l => {
      p.line(l.x1, l.y1, l.x2, l.y2);
    });
    p.pop();

    drawAtoms(p);
    drawResult(p);
    drawFPS(p);
  };

  p.windowResized = () => {
    bg = p.createGraphics(p.windowWidth, p.windowHeight);
    bg = drawBackground(p, bg, backgroundColor);
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
      const endAtom = findMouseOverAtom(atoms, { x: p.mouseX, y: p.mouseY });
      if (!endAtom) {
        const selectedAtom = findSelectedAtom(atoms);
        if (selectedAtom) unselectAtom(selectedAtom);
        return
      };

      const firstLine = lines[0];
      const startAtom = findMouseOverAtom(atoms, { x: firstLine.x1, y: firstLine.y1 });

      if (startAtom && endAtom && startAtom.x != endAtom.x && startAtom.y != endAtom.y) {
        startAtom.connect(endAtom);
      } else if (endAtom) {
        selectAtom(endAtom);
      }
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
    if (overAtom && overAtom.selected) {
      overAtom.dragging = true;
    }
  }
};

new p5(sketch);
