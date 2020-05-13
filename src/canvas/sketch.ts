import * as p5 from "p5";

import { Point, Line, distance } from "./geometry";
import Atom from "./atom";
import AtomShape from "./atom_shape";
import * as Legend from "./legend";
import { nearestGridPoint, gridPoints, gridTiles } from "./grid";
import * as ViewField from "./view_field";
import * as ValueInput from "./value_input";
import { selectAtom, unselectAtom, addAtom, connectAtoms, finishDrag, moveAtom, startDrag } from "../store";
import { edgesSelector, atomsSelector, selectedAtomSelector, draggingAtomSelector, moveCanvas } from "../store";
import { Store } from "redux";

export default function Sketch(store: Store) {
  return (p: p5) => {
    const HOLD_DURATION = 750;
    const HOLD_DIST_THRESHOLD = 20;

    let timestamp: number = undefined;
    let startPoint: Point = undefined;
    let keepDrawings = false;
    let showFPS = false;
    let lines: Line[] = [];

    let viewField: ViewField.ViewField;

    const backgroundColor = p.color("#FDFDFD");
    let bg: p5.Graphics = null;

    function findMouseOverAtom(atoms: Atom[], mouse: Point) {
      return atoms.find(atom => AtomShape.within(mouse, atom));
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
      const startAtom = findMouseOverAtom(atomsSelector(store), startPoint);
      const currentAtom = findMouseOverAtom(atomsSelector(store), currentPoint);

      switch (name) {
        case "startDrag":
          store.dispatch(selectAtom(startAtom.id));
          store.dispatch(startDrag(startAtom.id));
          break;

        case "finishDrag":
          const draggingAtomId = store.getState().draggingAtomId;

          const { x, y } = nearestGridPoint(currentPoint);
          store.dispatch(moveAtom(draggingAtomId, x, y));
          store.dispatch(finishDrag());
          break;

        case "create":
          const pointOnGrid = nearestGridPoint(currentPoint);
          const atom = new Atom(pointOnGrid.x, pointOnGrid.y);

          store.dispatch(addAtom(atom));
          store.dispatch(selectAtom(atom.id));
          break;

        case "select":
          store.dispatch(selectAtom(currentAtom.id));
          break;

        case "unselect":
          store.dispatch(unselectAtom());
          break;

        case "connect":
          store.dispatch(connectAtoms(startAtom.id, currentAtom.id));
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

      edgesSelector(store).forEach(e => p.line(e.x1, e.y1, e.x2, e.y2));

      p.pop();
    }

    function drawAtoms() {
      p.push();

      const atoms: Atom[] = atomsSelector(store);
      atoms.forEach(atom => {
        const selected = store.getState().selectedAtomId == atom.id;
        AtomShape.draw(p, atom, selected);
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

        const atom = findMouseOverAtom(atomsSelector(store), currentPoint);
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
      const content = Legend.text(store);
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
      p.frameRate(30);

      viewField = ViewField.init(p.windowWidth, p.windowHeight);

      p.createCanvas(p.windowWidth, p.windowHeight);
      bg = p.createGraphics(1000, 1000);
      bg = drawBackground(p, bg, backgroundColor);

      ValueInput.setup(p, store);
    };

    p.draw = () => {
      const { x, y } = store.getState().canvasTranslate;
      p.translate(x, y);

      ValueInput.update(p, store);

      if (p.mouseIsPressed === true && !store.getState().draggingAtom) {
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
    };

    p.mousePressed = (event: MouseEvent) => {
      const tagName = (event.srcElement as HTMLElement).tagName;
      if (tagName !== "CANVAS" && tagName !== "INPUT") return;

      timestamp = new Date().getTime();
      startPoint = mousePosition();

      const startAtom = findMouseOverAtom(atomsSelector(store), startPoint);
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

      const startAtom = findMouseOverAtom(atomsSelector(store), startPoint);
      const currentPoint = mousePosition();
      const currentAtom = findMouseOverAtom(atomsSelector(store), currentPoint);
      const dist = distance(startPoint, currentPoint);
      const selectedAtom = selectedAtomSelector(store);
      const draggingAtom = draggingAtomSelector(store);

      if (draggingAtom) {
        handleMouseEvent("finishDrag");
      } else if (startAtom && currentAtom && startAtom != currentAtom) {
        handleMouseEvent("connect");
      } else if (isClickAndHold && !startAtom && !currentAtom && dist <= HOLD_DIST_THRESHOLD) {
        handleMouseEvent("create");
      } else if (!isClickAndHold && currentAtom && currentAtom.id != draggingAtom?.id) {
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
      const { x, y } = ViewField.translateTo(viewField);
      store.dispatch(moveCanvas(x, y));
    }

    p.mouseDragged = () => {
      const draggingAtomId = store.getState().draggingAtomId;
      if (draggingAtomId) {
        const { x, y } = mousePosition();
        store.dispatch(moveAtom(draggingAtomId, x, y));
      }
    }

    p.keyReleased = () => {
      const atom = store.getState().selectedAtom;

      if (p.key == "d" && !atom) {
        keepDrawings = !keepDrawings;
      }

      if (p.key == "f" && !atom) {
        showFPS = !showFPS;
      }
    }
  }
}
