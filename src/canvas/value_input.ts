import * as p5 from "p5";
import { selectedAtomSelector, setAtomValue, ApplicationState } from "../store";
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
  const atomId = store.getState().default.selectedAtomId;
  const value = element.value().toString();
  store.dispatch(setAtomValue(atomId, value));
  setValue(value);
};

const handleStateChange = (store: Store<ApplicationState>) => {
  const state = store.getState();
  if (state.default.selectedAtomId && state.default.mode == "edit") {
    const atom = selectedAtomSelector(store);
    focus();
    setValue(atom.value);
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
