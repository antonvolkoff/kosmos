import * as p5 from "p5";
import { selectedAtomSelector, setAtomValue } from "../store";
import { Store } from "redux";

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

const handleInput = (store: Store) => {
  const atomId = store.getState().selectedAtomId;
  const value = element.value().toString();
  store.dispatch(setAtomValue(atomId, value));
  setValue(value);
};

const handleStateChange = (store: Store) => {
  const atom = selectedAtomSelector(store);
  if (atom) {
    focus();
    setValue(atom.value);
    setPosition(atom.x, atom.y);
  } else {
    blur();
    setValue("");
  }
};

export const setup = (p: p5, store: Store) => {
  element = p.createInput();
  element.hide();
  element.class("mousetrap atom-input");

  (element as any).input(() => handleInput(store));
  store.subscribe(() => handleStateChange(store));
};

export const update = (p: p5, store: Store) => {
};
