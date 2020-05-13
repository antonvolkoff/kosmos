export default class Atom {
  public id: string;
  public x: number;
  public y: number;
  public selected: boolean;
  public value: string;
  public outgoing: Atom[];
  public incoming: Atom[];
  public dragging: boolean;

  constructor(x: number, y: number, id: string = undefined, value = '') {
    this.id = id ? id : this.generateID();
    this.x = x;
    this.y = y;
    this.value = value;

    this.selected = false;
    this.dragging = false;

    this.outgoing = [];
    this.incoming = [];
  }

  parent(): Atom | undefined {
    return this.incoming[0];
  }

  private generateID(): string {
    return Date.now().toString();
  }
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

