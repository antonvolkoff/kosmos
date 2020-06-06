import * as p5 from "p5";
import { ApplicationState } from "../store";
import { setAtomValue } from "../store/defaultReducer";
import { getSelectedAtom, getMode, getViewField } from "./selectors";
import { Store } from "redux";
import { toLocalCoordinates, ViewField } from "./view_field";

let element: p5.Element;

const setPosition = (view: ViewField, x: number, y: number) => {
  const p = toLocalCoordinates(view, { x: x + 2, y: y - 9 });
  element.position(p.x, p.y);
}

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
  element = p.createInput();
  element.hide();
  element.class("mousetrap atom-input");

  (element as any).input(() => handleInput(store));
  store.subscribe(() => handleStateChange(store));
};

export const update = (p: p5, store: Store) => {
};
