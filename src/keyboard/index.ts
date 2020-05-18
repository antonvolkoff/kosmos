import * as Mousetrap from "mousetrap";
import { selectAtom, unselectAtom as unselectAtomAction, deleteAtom as deleteAtomAction, addAtom, connectAtoms, childrenSelector, ApplicationState } from "../store";
import { selectedAtomSelector, evalSelectedAtom, parentSelector, deepChildrenSelector, actions } from "../store";
import AtomShape from "../canvas/atom_shape";
import { createAtom } from "../store/atom";
import { nearestGridPoint } from "../canvas/grid";
import { Store } from "redux";

export default function Keyboard(store: Store<ApplicationState>) {
  let state = store.getState();
  let { selectedAtomId, mode } = state.default;
  let selectedAtom = selectedAtomSelector(store);

  store.subscribe(() => {
    state = store.getState();
    selectedAtomId = state.default.selectedAtomId;
    mode = state.default.mode;
    selectedAtom = selectedAtomSelector(store);
  });

  const standardAtomOffset = 40;
  const evaluateAtom = () => store.dispatch(evalSelectedAtom());
  const deleteAtom = (event) => {
    const atomId = selectedAtomId;
    if (!atomId) return;

    event.preventDefault();

    const parent = parentSelector(state, atomId);
    store.dispatch(deleteAtomAction(atomId));
    if (parent) store.dispatch(selectAtom(parent.id));
  };
  const createChildAtom = (event) => {
    const atom = selectedAtom;
    if (!atom) return;

    event.preventDefault();

    const children = deepChildrenSelector(state, atom.id);
    const bottomAtom = children[children.length - 1];

    const width = AtomShape.width(atom) + standardAtomOffset;
    const height = bottomAtom ? bottomAtom.y - atom.y + standardAtomOffset : 0;

    const { x, y } = nearestGridPoint({ x: atom.x + width, y: atom.y + height });
    const child = createAtom(x, y);
    store.dispatch(addAtom(child));

    store.dispatch(connectAtoms(atom.id, child.id));
    store.dispatch(selectAtom(child.id));
  };
  const createSiblingAtom = (event) => {
    const atom = selectedAtom;
    if (!atom) return;

    event.preventDefault();

    const parent = parentSelector(state, atom.id);
    const children = deepChildrenSelector(state, parent.id);
    const bottomAtom = children[children.length - 1];

    const height = bottomAtom ? standardAtomOffset : 0;

    const { x, y } = nearestGridPoint({ x: atom.x, y: bottomAtom.y + height, });
    const child = createAtom(x, y);
    store.dispatch(addAtom(child));

    store.dispatch(connectAtoms(parent.id, child.id));
    store.dispatch(selectAtom(child.id));
  };

  const unselectAtom = () => {
    if (!selectedAtomId) return;

    switch (mode) {
      case "edit":
        store.dispatch(actions.changeMode("ready"));
        break;
      case "ready":
        store.dispatch(unselectAtomAction());
        store.dispatch(actions.changeMode("idle"));
        break;
    }
  };

  const moveToParent = (event) => {
    const atom = selectedAtom;
    if (!atom) return;

    event.preventDefault();
    const parent = parentSelector(state, atom.id);
    if (parent) store.dispatch(selectAtom(parent.id));
  };
  const moveToChild = () => {
    const atom = selectedAtom;
    if (!atom) return;

    const child = childrenSelector(state, atom.id)[0];
    if (child) store.dispatch(selectAtom(child.id));
  };
  const moveToNextSibling = () => {
    const atom = selectedAtom
    if (!atom) return;

    const parent = parentSelector(state, atom.id);
    if (!parent) return;

    const children = childrenSelector(state, parent.id);
    const myIndex = children.findIndex(sibling => sibling.id == atom.id)
    const gotoAtom = children[myIndex + 1];
    if (gotoAtom) store.dispatch(selectAtom(gotoAtom.id));
  };
  const moveToPreviousSibling = () => {
    const atom = selectedAtom;
    if (!atom) return;

    const parent = parentSelector(state, atom.id);
    if (!parent) return;

    const children = childrenSelector(state, parent.id);
    const myIndex = children.findIndex(sibling => sibling.id == atom.id)
    const gotoAtom = children[myIndex - 1];
    if (gotoAtom) store.dispatch(selectAtom(gotoAtom.id));
  };

  Mousetrap.bind("command+e", evaluateAtom);
  Mousetrap.bind("command+backspace", deleteAtom);
  Mousetrap.bind("tab", createChildAtom);
  Mousetrap.bind("enter", createSiblingAtom);
  Mousetrap.bind("esc", unselectAtom);
  Mousetrap.bind("option+left", moveToParent);
  Mousetrap.bind("option+right", moveToChild);
  Mousetrap.bind("option+down", moveToNextSibling);
  Mousetrap.bind("option+up", moveToPreviousSibling);
}
