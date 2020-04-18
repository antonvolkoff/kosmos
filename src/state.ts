import * as fs from "fs";

import Atom from "./atom";
import * as JsonPacker from "./packers/json_packer";
import * as ClojurePacker  from "./packers/clojure_packer";
import executor from "./executor";
import * as File from "./state/file";

export interface State {
  entries(): string[];
  file(): File.File;
  atoms(): Atom[];

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
export let file = File.init();
export let atoms: Atom[] = [];
export let entries: string[] = [];

function notify(): void {
  subscribers.forEach(handler => handler());
}

function deleteAtomFromArray(atoms: Atom[], atom: Atom): void {
  const idx = atoms.findIndex((a) => a.id == atom.id);
  if(idx == -1) return;

  atoms.splice(idx, 1);
}

export function newFile(): void {
  file = File.init();
  atoms = [];
  notify();
};

export function openFile(path: string): void {
  file = File.setPath(file, path);
  const rawJson = fs.readFileSync(file.path);
  atoms = JsonPacker.unpack(rawJson.toString());
  notify();
}

export function saveFile(): void {
  const rawJson = JsonPacker.pack(atoms);
  fs.writeFileSync(file.path, rawJson);
}

export function saveAsFile(path: string): void {
  file = File.setPath(file, path);
  saveFile();
}

export function hasFile(): boolean {
  return !!file.path;
}

export function addAtom(atom: Atom): void {
  atoms.push(atom);
}

export function evalAtom(atom: Atom): void {
  executor(ClojurePacker.pack([atom])).then(addTranscriptEntry);
}

export function selectAtom(atom: Atom): void {
  atom.selected = true;
  notify();
}

export function unselectAtom(atom: Atom): void {
  atom.selected = false;
  notify();
}

export function deleteAtom(atom: Atom): void {
  atom.incoming.forEach(source => {
    deleteAtomFromArray(source.outgoing, atom);
  });

  atom.outgoing.forEach(target => {
    deleteAtomFromArray(target.incoming, atom);
  });

  deleteAtomFromArray(atoms, atom);
  notify();
}

export function connectAtoms(source: Atom, target: Atom): void {
  source.outgoing.push(target);
  target.incoming.push(source);
}

export function findSelectedAtom(): Atom | undefined {
  return atoms.find(atom => atom.selected);
}

export function findDraggingAtom(): Atom | undefined {
  return atoms.find(atom => atom.dragging);
}

export function addTranscriptEntry(entry: string): void {
  entries.push(entry);
  notify();
}

export function exportAsClojure(path: string): void {
  const data = ClojurePacker.pack(atoms);
  fs.writeFileSync(path, data);
};

export function getState(): string[] {
  return entries;
}

export function subscribe(handler: any): void {
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