import * as p5 from "p5";
import { ApplicationState } from "../store";
import { setAtomValue } from "../store/defaultReducer";
import { getSelectedAtom, getMode, getViewField } from "./selectors";
import { Store } from "redux";
import { toLocalCoordinates, ViewField } from "./view_field";

let element: HTMLTextAreaElement;

const canvasOffsetY = 46;

const setPosition = (view: ViewField, x: number, y: number) => {
  const p = toLocalCoordinates(view, { x: x + 2, y: y - 9 + canvasOffsetY});
  element.style.left = `${p.x}px`;
  element.style.top = `${p.y}px`;
}

const maxLineLength = (lines: string[]): number => {
  const lengths = lines.map((line) => line.length);
  return Math.max(...lengths);
};

const setValue = (value: string) => {
  element.value = value;
  const lines = value.split("\n");
  element.rows = lines.length;
  element.style.width = `${maxLineLength(lines) * 8.6 + 8.6}px`;
};

const focus = () => {
  element.hidden = false;
  element.focus({ preventScroll: true });
};

const blur = () => {
  element.hidden = true;
  element.blur();
};

const handleInput = (store: Store<ApplicationState>) => {
  const atom = getSelectedAtom(store.getState());
  const value = element.value;
  store.dispatch(setAtomValue(atom.id, value));
  window.kosmos.api.dispatch(["canvas/node-value-changed", [atom.id, value]]);
  setValue(value);
};

const handleStateChange = (store: Store<ApplicationState>) => {
  const state = store.getState();
  const atom = getSelectedAtom(state)
  const mode = getMode(state);
  const viewField = getViewField(state);

  if (atom && mode == "edit") {
    focus();
    setValue(atom.value);
    setPosition(viewField, atom.x, atom.y);
  } else if (atom && mode == "enter") {
    focus();
    setValue("");
    setPosition(viewField, atom.x, atom.y);
  } else {
    blur();
    setValue("");
  }
};

export const setup = (p: p5, store: Store<ApplicationState>) => {
  element = document.createElement("textarea");
  element.rows = 1;
  element.hidden = true;
  element.classList.add("mousetrap");
  element.classList.add("node-input");

  document.body.appendChild(element);

  element.oninput = () => handleInput(store);
  store.subscribe(() => handleStateChange(store));
};

export const update = (p: p5, store: Store) => {
};
