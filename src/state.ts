import * as fs from "fs";

import Atom from "./atom";
import { pack, unpack } from "./atom";

interface File {
  path: string;
}

export interface State {
  entries(): string[];
  file(): File;
  atoms(): Atom[];

  subscribe(handler: any): void;

  addAtom(atom: Atom): void;
  deleteAtom(atom: Atom): void;
  connectAtoms(source: Atom, target: Atom): void;
  findSelectedAtom(): Atom | undefined;
  findDraggingAtom(): Atom | undefined;

  addTranscriptEntry(entry: string): void;

  newFile(): void;
  openFile(path: string): void;
  saveAsFile(path: string): void;
  saveFile(): void;
  hasFile(): boolean;
};

let subscribers: any[] = [];
export let file: File = { path: undefined };
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
  file = { path: undefined };
  atoms = [];
};

export function openFile(path: string): void {
  file.path = path;
  const rawJson = fs.readFileSync(file.path);
  const packedAtoms = JSON.parse(rawJson.toString());
  atoms = unpack(packedAtoms);
}

export function saveFile(): void {
  const packedAtoms = pack(atoms);
  const rawJson = JSON.stringify(packedAtoms);
  fs.writeFileSync(file.path, rawJson);
}

export function saveAsFile(path: string): void {
  file.path = path;
  saveFile();
}

export function hasFile(): boolean {
  return !!file.path;
}

export function addAtom(atom: Atom): void {
  atoms.push(atom);
}

export function deleteAtom(atom: Atom): void {
  atom.incoming.forEach(source => {
    deleteAtomFromArray(source.outgoing, atom);
  });

  atom.outgoing.forEach(target => {
    deleteAtomFromArray(target.incoming, atom);
  });

  deleteAtomFromArray(atoms, atom);
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
  connectAtoms,
  findSelectedAtom,
  findDraggingAtom,
  addTranscriptEntry,
  subscribe,
} as State;