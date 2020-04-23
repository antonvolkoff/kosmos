import * as Mousetrap from "mousetrap";
import { State } from "./state/state";
import AtomShape from "./shapes/atom_shape";
import Atom from "./atom";

export default function Keyboard(state: State) {
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

    const width = AtomShape.width(atom);
    let height = 0;
    const bottomAtom = atom.sortedAdjacentAtoms()[atom.outgoing.length - 1];
    if (bottomAtom) {
      height = bottomAtom.y - atom.y + 40;
    }

    const child = new Atom(atom.x + width + 40, atom.y + height);
    state.addAtom(child);

    state.connectAtoms(atom, child);
    state.selectAtom(child);
  };
  const createSiblingAtom = (event) => {
    const atom = state.findSelectedAtom();
    if (!atom && atom.incoming.length != 0) return;

    event.preventDefault();

    const parent = atom.parent();
    const width = AtomShape.width(parent);
    let height = 0;
    const bottomAtom = parent.sortedAdjacentAtoms()[parent.outgoing.length - 1];
    if (bottomAtom) {
      height = bottomAtom.y - parent.y + 40;
    }

    const child = new Atom(parent.x + width + 40, parent.y + height);
    state.addAtom(child);

    state.connectAtoms(parent, child);
    state.selectAtom(child);
  };
  const unselectAtom = () => {
    const atom = state.findSelectedAtom();
    if (atom) state.unselectAtom(atom);
  };
  const moveToParent = () => {
    const atom = state.findSelectedAtom();
    if (!atom || atom.incoming.length == 0) return;

    const parent = atom.parent();
    state.selectAtom(parent);
  };
  const moveToChild = () => {
    const atom = state.findSelectedAtom();
    if (!atom || atom.outgoing.length == 0) return;

    const child = atom.outgoing[0];
    state.selectAtom(child);
  };
  const moveToNextSibling = () => {
    const atom = state.findSelectedAtom();
    if (!atom || atom.incoming.length == 0) return;

    const parent = atom.parent();
    const sortedOutgoing = parent.sortedAdjacentAtoms();
    if (sortedOutgoing.length == 1) return;

    const myPos = sortedOutgoing.findIndex(a => a.id == atom.id);
    if (myPos == sortedOutgoing.length - 1) return;

    const bottomAtom = sortedOutgoing[myPos + 1];
    state.selectAtom(bottomAtom);
  };
  const moveToPreviousSibling = () => {
    const atom = state.findSelectedAtom();
    if (!atom || atom.incoming.length == 0) return;

    const parent = atom.parent();
    const sortedOutgoing = parent.sortedAdjacentAtoms();
    if (sortedOutgoing.length == 1) return;

    const myPos = sortedOutgoing.findIndex(a => a.id == atom.id);
    if (myPos == 0) return;

    const topAtom = sortedOutgoing[myPos - 1];
    state.selectAtom(topAtom);
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
