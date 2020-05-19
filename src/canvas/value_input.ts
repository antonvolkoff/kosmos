import * as p5 from "p5";
import { ApplicationState } from "../store";
import { setAtomValue } from "../store/defaultReducer";
import { getSelectedAtom, getMode } from "./selectors";
import { Store } from "redux";

let element: p5.Element;

const setPosition = (x: number, y: number) => element.position(x + 2, y - 9);

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

const handleInput = (store: Store<ApplicationState>) => {
  const atom = getSelectedAtom(store.getState());
  const value = element.value().toString();
  store.dispatch(setAtomValue(atom.id, value));
  setValue(value);
};

const handleStateChange = (store: Store<ApplicationState>) => {
  const state = store.getState();
  const atom = getSelectedAtom(state)
  const mode = getMode(state);

  if (atom && mode == "edit") {
    focus();
    setValue(atom.value);
    setPosition(atom.x, atom.y);
  } else if (atom && mode == "enter") {
    focus();
    setValue("");
    setPosition(atom.x, atom.y);
  } else {
    blur();
    setValue("");
  }
};

export const setup = (p: p5, store: Store<ApplicationState>) => {
  element = p.createInput();
  element.hide();
  element.class("mousetrap atom-input");

  (element as any).input(() => handleInput(store));
  store.subscribe(() => handleStateChange(store));
};

export const update = (p: p5, store: Store) => {
};
