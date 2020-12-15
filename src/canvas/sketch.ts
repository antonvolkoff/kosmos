import * as p5 from "p5";
import { Store } from "redux";

import { buildNodeGeometry } from "./node_geometry";
import * as Legend from "./legend";
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

const canvasOffsetY = 46;

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

    let bg: p5.Graphics = null;

    const createClickPayload = (x: number, y: number): Click => {
      const clickedOn = (mouse) => (candidate) => buildNodeGeometry(candidate).isWithin(mouse);

      const mouse = ViewField.toGlobalCoordinates(viewField, { x, y });
      const atom = Object.values(atoms).find(clickedOn(mouse));
      const atomId = atom?.id;
      const dragArea = atom ? buildNodeGeometry(atom).isWithinDragArea(mouse) : false;
      const clickOffset = atom ? { deltaX: atom.x - mouse.x, deltaY: atom.y - mouse.y } : null;

      return { mouse, atomId, dragArea, clickOffset };
    };

    function drawAtoms() {
      atoms.forEach((node) => buildNodeGeometry(node).draw(p, node.selected));
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

      const windowHeight = p.windowHeight - canvasOffsetY;

      store.dispatch(
        actions.changeWindowDimensions({
          width: p.windowWidth,
          height: windowHeight,
        }),
      );

      p.createCanvas(p.windowWidth, windowHeight);
      bg = p.createGraphics(1000, 1000);

      ValueInput.setup(p, store);
    };

    p.draw = () => {
      p.clear();

      const { x, y } = translateValue;
      p.translate(x, y);

      ValueInput.update(p, store);

      if (draftConnection) {
        p.push();
        const { x1, y1, x2, y2 } = draftConnection;
        p.line(x1, y1, x2, y2);
        p.pop();
      }

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

      const payload = createClickPayload(p.mouseX, p.mouseY);
      store.dispatch(actions.mousePressed(payload));
    }

    p.mouseClicked = () => {
      const payload = createClickPayload(p.mouseX, p.mouseY);
      store.dispatch(actions.clicked(payload));
    }

    p.doubleClicked = () => {
      const payload = createClickPayload(p.mouseX, p.mouseY);
      store.dispatch(actions.doubleClicked(payload));
    }

    p.mouseWheel = (event: WheelEvent) => {
      store.dispatch(
        actions.moveCanvas({ deltaX: event.deltaX, deltaY: event.deltaY })
      );
      window.kosmos.api.dispatch(["canvas/moved", { dx: event.deltaX, dy: event.deltaY }]);
    }

    p.mouseDragged = () => {
      const payload = createClickPayload(p.mouseX, p.mouseY);
      store.dispatch(actions.mouseDragged(payload));
    }

    p.keyTyped = () => {
      if (mode == "ready") store.dispatch(actions.typed());
      return true;
    }
  }
}
