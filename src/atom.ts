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

  score() {
    return this.x * this.y;
  }

  sortedAdjacentAtoms() {
    return this.outgoing.sort((a, b) => a.score() - b.score());
  }

  parent(): Atom | undefined {
    return this.incoming[0];
  }

  private generateID(): string {
    return Date.now().toString();
  }
};

export const firstChild = (atom: Atom) => atom.sortedAdjacentAtoms()[0];
export const lastChild = (atom: Atom): Atom | undefined => {
  return atom.sortedAdjacentAtoms()[atom.outgoing.length - 1];
}

export const findParent = (atom: Atom): Atom | undefined => atom.incoming[0];

export const hasChildren = (atom: Atom): boolean => {
  return atom ? atom.outgoing.length > 0 : false;
};

export const lastNestedChild = (atom: Atom): Atom | undefined => {
  const child = lastChild(atom);
  return hasChildren(child) ? lastNestedChild(child) : child;
}

export const parentChildren = (atom: Atom): Atom[] => findParent(atom).sortedAdjacentAtoms();

export const nextSibling = (atom: Atom): Atom | undefined => {
  const idx = parentChildren(atom).findIndex(sibling => sibling.id == atom.id);
  return parentChildren(atom)[idx + 1];
}

export const previousSibling = (atom: Atom): Atom | undefined => {
  const idx = parentChildren(atom).findIndex(sibling => sibling.id == atom.id);
  return parentChildren(atom)[idx - 1];
}

