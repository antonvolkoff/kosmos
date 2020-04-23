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
