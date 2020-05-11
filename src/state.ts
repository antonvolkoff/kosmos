import * as fs from "fs";

import Atom from "./canvas/atom";
import * as JsonPacker from "./state/json_packer";
import * as ClojurePacker  from "./state/clojure_packer";
import * as Executor from "./state/executor";
import * as File from "./state/file";
import { Line, Point } from "./canvas/geometry";
import AtomShape from "./canvas/atom_shape";
import { nearestGridPoint } from "./canvas/grid";

export interface State {
  entries(): Executor.EvalResult[];
  file(): File.File;
  atoms(): Atom[];
  edges(): Line[];
  connectedToRepl(): boolean;

  subscribe(handler: any): void;

  setConnectedToRepl(connected: boolean): void;

  addAtom(atom: Atom): void;
  deleteAtom(atom: Atom): void;
  connectAtoms(source: Atom, target: Atom): void;

  moveAtom(atom: Atom, x: number, y: number): void;

  evalSelectedAtom(): void;

  selectAtom(atom: Atom);
  unselectAtom(atom: Atom);

  findSelectedAtom(): Atom | undefined;
  findDraggingAtom(): Atom | undefined;

  addTranscriptEntry(entry: Executor.EvalResult): void;

  newFile(): void;
  openFile(path: string): void;
  saveAsFile(path: string): void;
  saveFile(): void;
  hasFile(): boolean;

  exportAsClojure(path: string): void;

  setCanvasTranslate(point: Point);
  canvasTranslate(): Point;

  changeAtomValue(atom: Atom, value: string);
};

let subscribers: any[] = [];
let file = File.init();
let atoms: Atom[] = [];
let entries: Executor.EvalResult[] = [];
let connectedToRepl = false;
let canvasTranslatePoint: Point = { x: 0, y: 0 };

function notify(): void {
  subscribers.forEach(handler => handler());
}

function deleteAtomFromArray(atoms: Atom[], atom: Atom): void {
  const idx = atoms.findIndex((a) => a.id == atom.id);
  if(idx == -1) return;

  atoms.splice(idx, 1);
}

function edges(): Line[] {
  let lines: Line[] = [];

  atoms.forEach(source => {
    source.outgoing.forEach(target => {
      lines.push({ x1: source.x, y1: source.y, x2: target.x, y2: target.y });
    });
  })

  return lines;
}

function setConnectedToRepl(connected: boolean): void {
  connectedToRepl = connected;
  notify();
}

function newFile(): void {
  file = File.init();
  atoms = [];
  notify();
};

function openFile(path: string): void {
  file = File.setPath(file, path);
  const rawJson = fs.readFileSync(file.path);
  atoms = JsonPacker.unpack(rawJson.toString());
  notify();
}

function saveFile(): void {
  const rawJson = JsonPacker.pack(atoms);
  fs.writeFileSync(file.path, rawJson);
}

function saveAsFile(path: string): void {
  file = File.setPath(file, path);
  saveFile();
  notify();
}

function hasFile(): boolean {
  return !!file.path;
}

function addAtom(atom: Atom): void {
  atoms.push(atom);
}

function evalSelectedAtom(): void {
  const atom = findSelectedAtom();
  if (!atom) return;

  Executor.execute(ClojurePacker.pack([atom])).then(addTranscriptEntry);
}

function moveAtom(atom: Atom, x: number, y: number): void {
  const deltaX = x - atom.x;
  const deltaY = y - atom.y;
  atom.x = x;
  atom.y = y;
  atom.outgoing.forEach(child => {
    moveAtom(child, child.x + deltaX, child.y + deltaY);
  });
}

function selectAtom(atom: Atom): void {
  const selectedAtom = findSelectedAtom();
  if (selectedAtom) {
    selectedAtom.selected = false;
  }

  atom.selected = true;
  notify();
}

function unselectAtom(atom: Atom): void {
  atom.selected = false;
  notify();
}

function deleteAtom(atom: Atom): void {
  const parent = atom.parent();

  atom.incoming.forEach(source => {
    deleteAtomFromArray(source.outgoing, atom);
  });

  atom.outgoing.forEach(target => {
    deleteAtomFromArray(target.incoming, atom);
  });

  deleteAtomFromArray(atoms, atom);
  if (parent) selectAtom(parent);
  notify();
}

function connectAtoms(source: Atom, target: Atom): void {
  source.outgoing.push(target);
  target.incoming.push(source);
}

function findSelectedAtom(): Atom | undefined {
  return atoms.find(atom => atom.selected);
}

function findDraggingAtom(): Atom | undefined {
  return atoms.find(atom => atom.dragging);
}

function addTranscriptEntry(entry: Executor.EvalResult): void {
  entries.push(entry);
  notify();
}

function exportAsClojure(path: string): void {
  const data = ClojurePacker.pack(atoms);
  fs.writeFileSync(path, data);
};

function subscribe(handler: any): void {
  subscribers.push(handler);
}

function setCanvasTranslate(point: Point): void {
  canvasTranslatePoint = point;
}

const adjustDistance = (atom: Atom) => {
  const standardAtomOffset = 40;
  const width = AtomShape.width(atom) + standardAtomOffset;

  atom.outgoing.forEach(childAtom => {
    const { x, y } = nearestGridPoint({ x: atom.x + width, y: childAtom.y });
    childAtom.x = x;
    childAtom.y = y;
    adjustDistance(childAtom);
  });
}

function changeAtomValue(atom: Atom, value: string): void {
  atom.value = value;
  adjustDistance(atom);
}

export default {
  file() {
    return file;
  },
  atoms() {
    return atoms;
  },
  entries() {
    return entries;
  },
  connectedToRepl() {
    return connectedToRepl;
  },
  canvasTranslate() {
    return canvasTranslatePoint;
  },
  edges,
  newFile,
  openFile,
  saveFile,
  saveAsFile,
  hasFile,
  addAtom,
  deleteAtom,
  evalSelectedAtom,
  selectAtom,
  unselectAtom,
  connectAtoms,
  findSelectedAtom,
  findDraggingAtom,
  addTranscriptEntry,
  subscribe,
  exportAsClojure,
  setConnectedToRepl,
  moveAtom,
  setCanvasTranslate,
  changeAtomValue,
} as State;