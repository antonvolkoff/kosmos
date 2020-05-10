import * as p5 from "p5";

import State from "../state";
import { Point, Line, distance } from "./geometry";
import Atom from "./atom";
import AtomShape from "./atom_shape";
import * as Legend from "./legend";
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

  const placeInput = (x: number, y: number) => {
    valueInput.position(x + 16, y - 9);
  }

  function inputEvent() {
    const atom = State.findSelectedAtom();
    atom.value = this.value();
    valueInput.style(`width: ${atom.value.length * 8.6 + 8.6}px`);
  }

  function focusInput(atom: Atom) {
    valueInput.show();
    valueInput.elt.focus();
    valueInput.value(atom.value);
    placeInput(atom.x, atom.y);
    valueInput.style(`width: ${atom.value.length * 8.6 + 8.6}px`);
  }

  function blurInput() {
    valueInput.elt.blur();
    valueInput.value('');
    valueInput.hide();
  }

  const mousePosition =
    () : Point => {
      const mouse = { x: p.mouseX, y: p.mouseY };
      return ViewField.toGlobalCoordinates(viewField, mouse);
    };

  const previousMousePosition =
    () : Point => {
      const mouse = { x: p.pmouseX, y: p.pmouseY };
      return ViewField.toGlobalCoordinates(viewField, mouse);
    };

  function handleMouseEvent(name: string) {
    const currentPoint = mousePosition();
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
        State.moveAtom(draggingAtom, x, y);
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
      const currentPoint = mousePosition();
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
    if (!showFPS) return;

    const fps = p.frameRate();
    const { x, y } = ViewField.toGlobalCoordinates(viewField, { x: 10, y: 20 });

    p.push();
    p.textSize(14);
    p.fill(0);
    p.stroke(0);
    p.text("FPS: " + fps.toFixed(2), x, y);
    p.pop();
  }

  const drawLegend = () => {
    const content = Legend.text();
    const { x, y } =
      ViewField.toGlobalCoordinates(viewField, { x: 20, y: p.height - 30 });

    p.push();
    {
      p.fill(50);
      p.strokeWeight(0);
      p.textAlign(p.LEFT, p.CENTER);
      p.textFont("monospace", 13);
      p.text(content, x, y);
    }
    p.pop();
  };

  p.setup = () => {
    p.pixelDensity(2);

    viewField = ViewField.init(p.windowWidth, p.windowHeight);

    p.createCanvas(p.windowWidth, p.windowHeight);
    bg = p.createGraphics(1000, 1000);
    bg = drawBackground(p, bg, backgroundColor);

    valueInput = p.createInput();
    valueInput.position(p.width - 200, 65);
    valueInput.class("mousetrap atom-input");
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

    const selectedAtom = State.findSelectedAtom();
    if (selectedAtom) {
      placeInput(selectedAtom.x + x, selectedAtom.y + y);
    }

    if (p.mouseIsPressed === true && !State.findDraggingAtom()) {
      const p1 = mousePosition();
      const p2 = previousMousePosition();
      lines.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
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
    drawHoldAnimation();
    drawLegend();
    drawFPS();
  };

  p.windowResized = () => {
    viewField = ViewField.resize(viewField, p.windowWidth, p.windowHeight);
    p.resizeCanvas(p.windowWidth, p.windowHeight);

    valueInput.position(p.width - 200, 65);
  };

  p.mousePressed = (event: MouseEvent) => {
    const tagName = (event.srcElement as HTMLElement).tagName;
    if (tagName !== "CANVAS" && tagName !== "INPUT") return;

    timestamp = new Date().getTime();
    startPoint = mousePosition();

    const startAtom = findMouseOverAtom(State.atoms(), startPoint);
    if (startAtom && AtomShape.withinDragArea(startPoint, startAtom)) {
      handleMouseEvent("startDrag");
    }
  }

  p.mouseReleased = (event: MouseEvent) => {
    const tagName = (event.srcElement as HTMLElement).tagName;
    if (tagName !== "CANVAS" && tagName !== "INPUT") return;

    const now = new Date().getTime();
    const mousePressedDuration = now - timestamp;
    const isClickAndHold = mousePressedDuration > HOLD_DURATION;

    const startAtom = findMouseOverAtom(State.atoms(), startPoint);
    const currentPoint = mousePosition();
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
      const { x, y } = mousePosition();
      State.moveAtom(draggingAtom, x, y);
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
