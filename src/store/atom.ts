export interface Atom {
  id: string;
  x: number;
  y: number;
  value: string;
  outgoing: Atom[];
  incoming: Atom[];
}

const generateId = (): string => Date.now().toString();

export const createAtom = (x = 0, y = 0): Atom => {
  return {
    id: generateId(),
    x,
    y,
    value: "",
    outgoing: [],
    incoming: [],
  };
};

const score = ({ x, y }) => x * y;

export const sortedAdjacentAtoms = (atom: Atom) => {
  return atom.outgoing.sort((a, b) => score(a) - score(b));
}

export const firstChild = (atom: Atom) => sortedAdjacentAtoms(atom)[0];
export const lastChild = (atom: Atom): Atom | undefined => {
  return sortedAdjacentAtoms(atom)[atom.outgoing.length - 1];
}

export const findParent = (atom: Atom): Atom | undefined => atom.incoming[0];

export const hasChildren = (atom: Atom): boolean => {
  return atom ? atom.outgoing.length > 0 : false;
};

export const lastNestedChild = (atom: Atom): Atom | undefined => {
  const child = lastChild(atom);
  return hasChildren(child) ? lastNestedChild(child) : child;
}

export const parentChildren =
  (atom: Atom): Atom[] => sortedAdjacentAtoms(findParent(atom));

export const nextSibling = (atom: Atom): Atom | undefined => {
  const idx = parentChildren(atom).findIndex(sibling => sibling.id == atom.id);
  return parentChildren(atom)[idx + 1];
}

export const previousSibling = (atom: Atom): Atom | undefined => {
  const idx = parentChildren(atom).findIndex(sibling => sibling.id == atom.id);
  return parentChildren(atom)[idx - 1];
}

