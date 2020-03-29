interface Atom {
  id: number;
  x: number;
  y: number;
  selected: boolean;
  value: string;
  adjacentAtoms: Atom[];
};

let id = 0;

const create = (x: number, y: number): Atom => {
  return { id: id++, x: x, y: y, selected: false, value: '', adjacentAtoms: [] };
};

const connect = (parent: Atom, child: Atom) => {
  parent.adjacentAtoms.push(child);
};

export { Atom, create, connect }