import * as p5 from "p5";
import { Atom, create } from "./atom";

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

let atoms : Atom[] = [];
let lines : Line[] = [];
let mouseStack: MousePosition[] = [];
let valueInput: p5.Element = undefined;

const selectedAtom = (): Atom | undefined => {
  console.log(atoms);
  return atoms.find(atom => atom.selected);
}

const hasSelectedAtom = (): boolean => {
  return (selectedAtom() == undefined) ? false : true;
};

function createAtom() {
  const position = mouseStack.pop();
  const atom = create(position.x, position.y);
  atoms.push(atom);

  if (hasSelectedAtom()) {
    selectedAtom().selected = false;
    valueInput.value('');
  }

  atom.selected = true;
  valueInput.value(atom.value);
  valueInput.elt.focus();
};

function createLine() {
  const end = mouseStack.pop();
  const start = mouseStack.pop();
  lines.push({ x1: start.x, y1: start.y, x2: end.x, y2: end.y });
}

function hasClickedOnAtom(mouse: MousePosition, atom: Atom) {
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

    if (hasClickedOnAtom(mouse, atom)) {
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

  lines.forEach(line => {
    s.line(line.x1, line.y1, line.x2, line.y2);
  });

  s.pop();
}

function pushMousePosition(x: number, y: number) {
  mouseStack.push({ x: x, y: y });
};

function inputEvent() {
  const atom = selectedAtom();
  atom.value = this.value();
}

export default function(s: p5) {
  let points = [];
  let rPoints = [];
  let shapeName = "";

  let bg: p5.Graphics = null;

  const drawFPS = () => {
    const fps = s.frameRate();
    s.textSize(14);
    s.fill(0);
    s.stroke(0);
    s.text("FPS: " + fps.toFixed(2), 10, s.height - 10);
  };

  const drawBackground = (bg: p5.Graphics) => {
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

  s.setup = () => {
    s.createCanvas(s.windowWidth, s.windowHeight);
    bg = drawBackground(s.createGraphics(s.windowWidth, s.windowHeight));

    valueInput = s.createInput();
    valueInput.position(s.width - 200, 65);
    (valueInput as any).input(inputEvent);
  };

  s.draw = () => {
    s.image(bg, 0, 0, s.windowWidth, s.windowHeight);
    drawLines(s);
    drawAtoms(s);
    drawFPS();
  };

  s.windowResized = () => {
    bg = drawBackground(s.createGraphics(s.windowWidth, s.windowHeight));
    s.resizeCanvas(s.windowWidth, s.windowHeight);
  }

  s.doubleClicked = () => {
    pushMousePosition(s.mouseX, s.mouseY);
    createAtom();
  }

  s.mouseClicked = () => {
    selectAtom({ x: s.mouseX, y: s.mouseY });
  }
};
