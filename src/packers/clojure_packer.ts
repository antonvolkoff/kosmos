import Atom from "../atom";

export function translate(atom: Atom): string {
  // Integer
  if (atom.value.match(/^[0-9]*$/))
    return atom.value;

  // String
  if (atom.value.match(/^"(?:\\.|[^\\"])*"$/))
    return atom.value;

  // Ref
  if (atom.outgoing.length == 0)
    return atom.value;

  const childValues = atom.sortedAdjacentAtoms().map(translate);

  return `(${[atom.value, ...childValues].join(" ")})`;
}

export function pack(atoms: Atom[]): string {
  const topLevelAtoms = atoms.filter(atom => atom.incoming.length == 0);
  return topLevelAtoms.map(translate).join("\n");
}

export function unpack(data: string): Atom[] {
  return [];
}
