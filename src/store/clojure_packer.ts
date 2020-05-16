import { Atom, sortedAdjacentAtoms } from "./atom";

function translate(atom: Atom): string {
  // Integer
  if (atom.value.match(/^[0-9]*$/))
    return atom.value;

  // String
  if (atom.value.match(/^"(?:\\.|[^\\"])*"$/))
    return atom.value;

  // Ref
  if (atom.outgoing.length == 0)
    return atom.value;

  const childValues = sortedAdjacentAtoms(atom).map(translate);

  return `(${[atom.value, ...childValues].join(" ")})`;
}

export function pack(atoms: Atom[]): string {
  let topLevelAtoms: Atom[] = [];
  if (atoms.length == 1) {
    topLevelAtoms = atoms;
  } else {
    topLevelAtoms = atoms.filter(atom => atom.incoming.length == 0);
  }

  return topLevelAtoms.map(translate).join("\n") + "\n";
}

export function unpack(data: string): Atom[] {
  return [];
}
