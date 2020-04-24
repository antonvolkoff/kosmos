import * as p5 from "p5";

import State from "./state/state";
import { Point, Line, distance } from "./geometry";
import Atom from "./atom";
import AtomShape from "./shapes/atom_shape";
import LegendShape from "./shapes/legend_shape";
import { nearestGridPoint, gridPoints, gridTiles } from "./grid";
import * as ViewField from "./view_field";

export default function Sketch(p: p5) {
  const HOLD_DURATION = 750;
  const HOLD_DIST_THRESHOLD = 20;

  let timestamp: number = undefined;
  let startPoint: Point = undefined;
  let keepDrawings = false;
  let showFPS = false;
  let lines: Line[] = [];

  let viewField: ViewField.ViewField;

  const backgroundColor = p.color("#FDFDFD");
  let valueInput: p5.Element = undefined;
  let bg: p5.Graphics = null;

  function findMouseOverAtom(atoms: Atom[], mouse: Point) {
    return atoms.find(atom => AtomShape.within(mouse, atom));
  }

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

  function handleMouseEvent(name: string) {
    const currentPoint: Point = { x: p.mouseX, y: p.mouseY };
    const startAtom = findMouseOverAtom(State.atoms(), startPoint);
    const currentAtom = findMouseOverAtom(State.atoms(), currentPoint);

    switch (name) {
      case "startDrag":
        startAtom.dragging = true;
        State.selectAtom(startAtom);
        break;

      case "finishDrag":
        const draggingAtom = State.findDraggingAtom();

        const { x, y } = nearestGridPoint(currentPoint);
        draggingAtom.x = x;
        draggingAtom.y = y;
        draggingAtom.dragging = false;
        focusInput(draggingAtom);
        break;

      case "create":
        const pointOnGrid = nearestGridPoint(currentPoint);
        const atom = new Atom(pointOnGrid.x, pointOnGrid.y);
        State.addAtom(atom);
        State.selectAtom(atom);
        break;

      case "select":
        State.selectAtom(currentAtom);
        break;

      case "unselect":
        State.unselectAtom(State.findSelectedAtom());
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

    p.strokeWeight(1.5);
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

  function drawBackground(s: p5, bg: p5.Graphics, color: p5.Color) {
    const renderPoint = ({x, y}: Point) => bg.point(x, y);

    bg.background(color);
    bg.stroke(210);
    bg.strokeWeight(3);

    gridPoints(bg.width, bg.height).forEach(renderPoint);

    return bg;
  }

  function drawFPS() {
    const fps = p.frameRate();

    p.push();
    p.textSize(14);
    p.fill(0);
    p.stroke(0);
    p.text("FPS: " + fps.toFixed(2), 10, 20);
    p.pop();
  }

  p.setup = () => {
    viewField = ViewField.init(p.windowWidth, p.windowHeight);

    p.createCanvas(p.windowWidth, p.windowHeight);
    bg = p.createGraphics(1000, 1000);
    bg = drawBackground(p, bg, backgroundColor);

    valueInput = p.createInput();
    valueInput.position(p.width - 200, 65);
    valueInput.class("mousetrap");
    (valueInput as any).input(inputEvent);

    State.subscribe(() => {
      const atom = State.findSelectedAtom();
      if (atom) {
        focusInput(atom);
      } else {
        blurInput();
      }
    })
  };

  p.draw = () => {
    const { x, y } = ViewField.translateTo(viewField);
    p.translate(x, y);

    if (p.mouseIsPressed === true && !State.findDraggingAtom()) {
      lines.push({ x1: p.mouseX, y1: p.mouseY, x2: p.pmouseX, y2: p.pmouseY });
    } else {
      if (!keepDrawings) lines = [];
    }

    const tiles = gridTiles(viewField, bg.width, bg.height);
    tiles.forEach(({ x, y, width, height}) => p.image(bg, x, y, width, height));

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

    if (showFPS) drawFPS();
  };

  p.windowResized = () => {
    viewField = ViewField.resize(viewField, p.windowWidth, p.windowHeight);
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

  p.mouseWheel = (event: WheelEvent) => {
    viewField = ViewField.move(viewField, event.deltaX, event.deltaY);
  }

  p.mouseDragged = () => {
    const draggingAtom = State.findDraggingAtom();
    if (draggingAtom) {
      draggingAtom.x = p.mouseX;
      draggingAtom.y = p.mouseY;
    }
  }

  p.keyReleased = () => {
    const atom = State.findSelectedAtom();

    if (p.key == "d" && !atom) {
      keepDrawings = !keepDrawings;
    }

    if (p.key == "f" && !atom) {
      showFPS = !showFPS;
    }
  }
}
