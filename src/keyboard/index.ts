import * as Mousetrap from "mousetrap";
import { selectAtom, unselectAtom as unselectAtomAction, deleteAtom as deleteAtomAction, addAtom, connectAtoms } from "../store";
import { selectedAtomSelector, evalSelectedAtom } from "../store";
import AtomShape from "../canvas/atom_shape";
import Atom from "../canvas/atom";
import { lastNestedChild, findParent, firstChild, nextSibling, previousSibling } from "../canvas/atom";
import { nearestGridPoint } from "../canvas/grid";
import { Store } from "redux";

export default function Keyboard(store: Store) {
  const standardAtomOffset = 40;
  const evaluateAtom = () => store.dispatch(evalSelectedAtom());
  const deleteAtom = (event) => {
    const atomId = store.getState().selectedAtomId;
    if (!atomId) return;

    event.preventDefault();

    const parent = findParent(store.getState().atoms[atomId]);
    store.dispatch(deleteAtomAction(atomId));
    if (parent) store.dispatch(selectAtom(parent.id));
  };
  const createChildAtom = (event) => {
    const atom = selectedAtomSelector(store);
    if (!atom) return;

    event.preventDefault();

    const bottomAtom = lastNestedChild(atom);

    const width = AtomShape.width(atom) + standardAtomOffset;
    const height = bottomAtom ? bottomAtom.y - atom.y + standardAtomOffset : 0;

    const { x, y } = nearestGridPoint({ x: atom.x + width, y: atom.y + height });
    const child = new Atom(x, y);
    store.dispatch(addAtom(child));

    store.dispatch(connectAtoms(atom.id, child.id));
    store.dispatch(selectAtom(child.id));
  };
  const createSiblingAtom = (event) => {
    const atom = selectedAtomSelector(store);
    if (!atom && atom.incoming.length != 0) return;

    event.preventDefault();

    const parent = findParent(atom);
    const bottomAtom = lastNestedChild(parent);

    const height = bottomAtom ? standardAtomOffset : 0;

    const { x, y } = nearestGridPoint({ x: atom.x, y: bottomAtom.y + height, });
    const child = new Atom(x, y);
    store.dispatch(addAtom(child));

    store.dispatch(connectAtoms(parent.id, child.id));
    store.dispatch(selectAtom(child.id));
  };
  const unselectAtom = () => {
    if (store.getState().selectedAtomId) store.dispatch(unselectAtomAction());
  };
  const moveToParent = (event) => {
    const atom = selectedAtomSelector(store);
    if (!atom || atom.incoming.length == 0) return;

    event.preventDefault();
    const parent = findParent(atom);
    if (parent) store.dispatch(selectAtom(parent.id));
  };
  const moveToChild = () => {
    const atom = selectedAtomSelector(store);
    if (!atom || atom.outgoing.length == 0) return;

    const child = firstChild(atom);
    if (child) store.dispatch(selectAtom(child.id));
  };
  const moveToNextSibling = () => {
    const atom = selectedAtomSelector(store);
    if (!atom || atom.incoming.length == 0) return;

    const gotoAtom = nextSibling(atom);
    if (gotoAtom) store.dispatch(selectAtom(gotoAtom.id));
  };
  const moveToPreviousSibling = () => {
    const atom = selectedAtomSelector(store);
    if (!atom || atom.incoming.length == 0) return;

    const gotoAtom = previousSibling(atom);
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
