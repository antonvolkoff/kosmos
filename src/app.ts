import * as p5 from "p5";
import { remote, ipcRenderer } from "electron";
import { render } from "react-dom";
import { html } from "htm/react";
import * as Mousetrap from "mousetrap";

import State from "./state/state";
import Transcript from "./components/transcript";
import Control from "./components/control";
import Sketch from "./sketch";
import Atom from "./atom";
import AtomShape from "./shapes/atom_shape";

const { dialog } = remote;

ipcRenderer.on('click-new', () => {
  State.newFile();
});
ipcRenderer.on('click-open', () => {
  dialog.showOpenDialog({}).then(result => {
    State.openFile(result.filePaths[0]);
  });
});
ipcRenderer.on('click-save', () => {
  if (State.hasFile()) {
    State.saveFile();
  } else {
    dialog.showSaveDialog({}).then(result => {
      State.saveAsFile(result.filePath);
    });
  }
})
ipcRenderer.on('click-save-as', () => {
  dialog.showSaveDialog({}).then(result => {
    State.saveAsFile(result.filePath);
  });
});
ipcRenderer.on("click-export", () => {
  dialog.showSaveDialog({}).then(result => {
    State.exportAsClojure(result.filePath);
  });
});

State.subscribe(() => {
  document.title = `${State.file().name} - Kosmos`;
});

Mousetrap.bind("command+e", () => State.evalSelectedAtom());
Mousetrap.bind("command+backspace", (event) => {
  const atom = State.findSelectedAtom();
  if (!atom) return;

  event.preventDefault();

  const parent = atom.parent();
  State.deleteAtom(atom);

  if (parent) State.selectAtom(parent);
});
Mousetrap.bind("tab", (event) => {
  const atom = State.findSelectedAtom();
  if (!atom) return;

  event.preventDefault();

  const width = AtomShape.width(atom);
  let height = 0;
  const bottomAtom = atom.sortedAdjacentAtoms()[atom.outgoing.length - 1];
  if (bottomAtom) {
    height = bottomAtom.y - atom.y + 40;
  }

  const child = new Atom(atom.x + width + 40, atom.y + height);
  State.addAtom(child);

  State.connectAtoms(atom, child);
  State.selectAtom(child);
});
Mousetrap.bind("enter", (event) => {
  const atom = State.findSelectedAtom();
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
  State.addAtom(child);

  State.connectAtoms(parent, child);
  State.selectAtom(child);
});
Mousetrap.bind("esc", () => {
  const atom = State.findSelectedAtom();
  if (atom) State.unselectAtom(atom);
});
Mousetrap.bind("option+left", () => {
  const atom = State.findSelectedAtom();
  if (!atom || atom.incoming.length == 0) return;

  const parent = atom.parent();
  State.selectAtom(parent);
});
Mousetrap.bind("option+right", () => {
  const atom = State.findSelectedAtom();
  if (!atom || atom.outgoing.length == 0) return;

  const child = atom.outgoing[0];
  State.selectAtom(child);
});
Mousetrap.bind("option+down", () => {
  const atom = State.findSelectedAtom();
  if (!atom || atom.incoming.length == 0) return;

  const parent = atom.parent();
  const sortedOutgoing = parent.sortedAdjacentAtoms();
  if (sortedOutgoing.length == 1) return;

  const myPos = sortedOutgoing.findIndex(a => a.id == atom.id);
  if (myPos == sortedOutgoing.length - 1) return;

  const bottomAtom = sortedOutgoing[myPos + 1];
  State.selectAtom(bottomAtom);
});
Mousetrap.bind("option+up", () => {
  const atom = State.findSelectedAtom();
  if (!atom || atom.incoming.length == 0) return;

  const parent = atom.parent();
  const sortedOutgoing = parent.sortedAdjacentAtoms();
  if (sortedOutgoing.length == 1) return;

  const myPos = sortedOutgoing.findIndex(a => a.id == atom.id);
  if (myPos == 0) return;

  const topAtom = sortedOutgoing[myPos - 1];
  State.selectAtom(topAtom);
});

const canvasPlaceholder = document.getElementById("canvas");
const transcriptPlaceholder = document.getElementById("transcript");
const controlPlaceholder = document.getElementById("control");

new p5(Sketch, canvasPlaceholder);

render(html`<${Transcript} state="${State}" />`, transcriptPlaceholder);
render(html`<${Control} state=${State} />`, controlPlaceholder);
