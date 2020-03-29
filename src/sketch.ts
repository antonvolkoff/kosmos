import * as p5 from "p5";
import { Atom } from "./atom";

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

function createAtom() {
  const position = mouseStack.pop();
  atoms.push({ ...position, selected: false });
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

function selectAtom() {
  const position = mouseStack.pop();

  for (let i = 0; i < atoms.length; i++) {
    const atom = atoms[i];
    if (hasClickedOnAtom(position, atom)) {
      atom.selected = !atom.selected;
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
    pushMousePosition(s.mouseX, s.mouseY);
    selectAtom();
  }
};
