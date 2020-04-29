import * as Mousetrap from "mousetrap";
import { State } from "./state/state";
import AtomShape from "./shapes/atom_shape";
import Atom from "./atom";
import { lastNestedChild, findParent, firstChild, nextSibling, previousSibling } from "./atom";
import { nearestGridPoint } from "./grid";

export default function Keyboard(state: State) {
  const standardAtomOffset = 40;
  const evaluateAtom = () => state.evalSelectedAtom();
  const deleteAtom = (event) => {
    const atom = state.findSelectedAtom();
    if (!atom) return;

    event.preventDefault();
    state.deleteAtom(atom);
  };
  const createChildAtom = (event) => {
    const atom = state.findSelectedAtom();
    if (!atom) return;

    event.preventDefault();

    const bottomAtom = lastNestedChild(atom);

    const width = AtomShape.width(atom) + standardAtomOffset;
    const height = bottomAtom ? bottomAtom.y - atom.y + standardAtomOffset : 0;

    const { x, y } = nearestGridPoint({ x: atom.x + width, y: atom.y + height });
    const child = new Atom(x, y);
    state.addAtom(child);

    state.connectAtoms(atom, child);
    state.selectAtom(child);
  };
  const createSiblingAtom = (event) => {
    const atom = state.findSelectedAtom();
    if (!atom && atom.incoming.length != 0) return;

    event.preventDefault();

    const parent = findParent(atom);
    const bottomAtom = lastNestedChild(parent);

    const height = bottomAtom ? standardAtomOffset : 0;

    const { x, y } = nearestGridPoint({ x: atom.x, y: bottomAtom.y + height, });
    const child = new Atom(x, y);
    state.addAtom(child);

    state.connectAtoms(parent, child);
    state.selectAtom(child);
  };
  const unselectAtom = () => {
    const atom = state.findSelectedAtom();
    if (atom) state.unselectAtom(atom);
  };
  const moveToParent = (event) => {
    const atom = state.findSelectedAtom();
    if (!atom || atom.incoming.length == 0) return;

    event.preventDefault();
    const parent = findParent(atom);
    if (parent) state.selectAtom(parent);
  };
  const moveToChild = () => {
    const atom = state.findSelectedAtom();
    if (!atom || atom.outgoing.length == 0) return;

    const child = firstChild(atom);
    if (child) state.selectAtom(child);
  };
  const moveToNextSibling = () => {
    const atom = state.findSelectedAtom();
    if (!atom || atom.incoming.length == 0) return;

    const gotoAtom = nextSibling(atom);
    if (gotoAtom) state.selectAtom(gotoAtom);
  };
  const moveToPreviousSibling = () => {
    const atom = state.findSelectedAtom();
    if (!atom || atom.incoming.length == 0) return;

    const gotoAtom = previousSibling(atom);
    if (gotoAtom) state.selectAtom(gotoAtom);
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
