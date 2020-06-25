import * as p5 from "p5";
import { Store } from "redux";

import { Point } from "./geometry";
import { buildNodeGeometry, drawNode } from "./node_geometry";
import { buildEdgeGeometry } from "./edge_geometry";
import * as Legend from "./legend";
import { gridPoints, gridTiles } from "./grid";
import * as ViewField from "./view_field";
import * as ValueInput from "./value_input";
import { ApplicationState } from "../store";

import { actions, Click } from "./canvasReducer";
import {
  getDrawableAtoms,
  getViewField,
  getTranslateValue,
  getDrawableEdges,
  getDraftConnection,
  getMode,
} from "./selectors";

export default function Sketch(store: Store<ApplicationState>) {
  return (p: p5) => {
    let state = store.getState();
    let atoms = getDrawableAtoms(state);
    let edges = getDrawableEdges(state);
    let viewField = getViewField(state);
    let translateValue = getTranslateValue(state);
    let draftConnection = getDraftConnection(state);
    let mode = getMode(state);

    store.subscribe(() => {
      state = store.getState();
      atoms = getDrawableAtoms(state);
      edges = getDrawableEdges(state);
      viewField = getViewField(state);
      translateValue = getTranslateValue(state);
      draftConnection = getDraftConnection(state);
      mode = getMode(state);
      p.redraw();
    });

    const backgroundColor = p.color("#FDFDFD");
    let bg: p5.Graphics = null;

    const createClickPayload = (): Click => {
      const mouse = { x: p.mouseX, y: p.mouseY };
      const atomId = null;
      const dragArea = false;
      return { mouse, atomId, dragArea };
    }

    function drawEdges() {
      edges.forEach(e => buildEdgeGeometry(e).draw(p));
    }

    function drawAtoms() {
      p.push();
      atoms.forEach(atom => {
        drawNode(p, buildNodeGeometry(atom), atom.selected);
      });
      p.pop();
    }

    function drawBackground(s: p5, bg: p5.Graphics, color: p5.Color) {
      const renderPoint = ({x, y}: Point) => bg.point(x, y);

      bg.background(color);
      bg.stroke(210);
      bg.strokeWeight(3);

      gridPoints(bg.width, bg.height).forEach(renderPoint);

      return bg;
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
      p.noLoop();

      store.dispatch(
        actions.changeWindowDimensions({
          width: p.windowWidth,
          height: p.windowHeight,
        }),
      );

      p.createCanvas(p.windowWidth, p.windowHeight);
      bg = p.createGraphics(1000, 1000);
      bg = drawBackground(p, bg, backgroundColor);

      ValueInput.setup(p, store);
    };

    p.draw = () => {
      const { x, y } = translateValue;
      p.translate(x, y);

      ValueInput.update(p, store);

      const tiles = gridTiles(viewField, bg.width, bg.height);
      tiles.forEach(({ x, y, width, height}) => p.image(bg, x, y, width, height));

      if (draftConnection) {
        p.push();
        const { x1, y1, x2, y2 } = draftConnection;
        p.line(x1, y1, x2, y2);
        p.pop();
      }


      drawEdges();
      drawAtoms();
      drawLegend();
    };

    p.windowResized = () => {
      store.dispatch(
        actions.changeWindowDimensions({
          width: p.windowWidth,
          height: p.windowHeight,
        }),
      );
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    p.mousePressed = (event: MouseEvent) => {
      const tagName = (event.srcElement as HTMLElement).tagName;
      if (tagName !== "CANVAS" && tagName !== "INPUT") return;

      store.dispatch(actions.mousePressed(createClickPayload()));
    }

    p.mouseClicked = () => {
      store.dispatch(actions.clicked(createClickPayload()));
    }

    p.doubleClicked = () => {
      store.dispatch(actions.doubleClicked(createClickPayload()));
    }

    p.mouseWheel = (event: WheelEvent) => {
      store.dispatch(
        actions.moveCanvas({ deltaX: event.deltaX, deltaY: event.deltaY })
      );
    }

    p.mouseDragged = () => {
      store.dispatch(actions.mouseDragged(createClickPayload()));
    }

    p.keyTyped = () => {
      if (mode == "ready") store.dispatch(actions.typed());
      return true;
    }
  }
}
