import * as p5 from "p5";
import { State } from "../state";

let element: p5.Element;
let dragging = false;

const setPosition = (x: number, y: number) => element.position(x + 16, y - 9);

const setValue = (value: string) => {
  element.value(value);
  element.style(`width: ${value.length * 8.6 + 8.6}px`);
};

const focus = () => {
  element.show();
  element.elt.focus();
};

const blur = () => {
  element.hide();
  element.elt.blur();
};

const handleInput = (state: State) => {
  const atom = state.findSelectedAtom();
  atom.value = element.value().toString();
  setValue(atom.value);
};

const handleStateChange = (state: State) => {
  const atom = state.findSelectedAtom();
  if (atom) {
    focus();
    setValue(atom.value);
    setPosition(atom.x, atom.y);
  } else {
    blur();
    setValue("");
  }
};

export const setup = (p: p5, state: State) => {
  element = p.createInput();
  element.hide();
  element.class("mousetrap atom-input");

  (element as any).input(() => handleInput(state));
  state.subscribe(() => handleStateChange(state));
};

export const update = (p: p5, state: State) => {
  const atom = state.findSelectedAtom();
  if (!atom) return;

  const translation = state.canvasTranslate();
  focus();
  setValue(atom.value);
  setPosition(atom.x + translation.x, atom.y + translation.y);

  if (atom.dragging && !dragging) {
    // Start dragging
    dragging = true;
    blur();
  }

  if (!atom.dragging && dragging) {
    // Finish dragging
    dragging = false;
    focus();
  }
};
