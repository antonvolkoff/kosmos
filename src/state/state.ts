import * as fs from "fs";

import Atom from "../atom";
import * as JsonPacker from "../packers/json_packer";
import * as ClojurePacker  from "../packers/clojure_packer";
import executor from "../executor";
import * as File from "./file";
import { Line } from "../geometry";

export interface State {
  entries(): string[];
  file(): File.File;
  atoms(): Atom[];
  edges(): Line[];

  subscribe(handler: any): void;

  addAtom(atom: Atom): void;
  deleteAtom(atom: Atom): void;
  connectAtoms(source: Atom, target: Atom): void;

  evalAtom(atom: Atom): void;

  selectAtom(atom: Atom);
  unselectAtom(atom: Atom);

  findSelectedAtom(): Atom | undefined;
  findDraggingAtom(): Atom | undefined;

  addTranscriptEntry(entry: string): void;

  newFile(): void;
  openFile(path: string): void;
  saveAsFile(path: string): void;
  saveFile(): void;
  hasFile(): boolean;

  exportAsClojure(path: string): void;
};

let subscribers: any[] = [];
let file = File.init();
let atoms: Atom[] = [];
let entries: string[] = [];

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
}

function hasFile(): boolean {
  return !!file.path;
}

function addAtom(atom: Atom): void {
  atoms.push(atom);
}

function evalAtom(atom: Atom): void {
  executor(ClojurePacker.pack([atom])).then(addTranscriptEntry);
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
  atom.incoming.forEach(source => {
    deleteAtomFromArray(source.outgoing, atom);
  });

  atom.outgoing.forEach(target => {
    deleteAtomFromArray(target.incoming, atom);
  });

  deleteAtomFromArray(atoms, atom);
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

function addTranscriptEntry(entry: string): void {
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
  edges,
  newFile,
  openFile,
  saveFile,
  saveAsFile,
  hasFile,
  addAtom,
  deleteAtom,
  evalAtom,
  selectAtom,
  unselectAtom,
  connectAtoms,
  findSelectedAtom,
  findDraggingAtom,
  addTranscriptEntry,
  subscribe,
  exportAsClojure,
} as State;