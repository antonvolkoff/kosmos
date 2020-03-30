export default class Atom {
  public x: number;
  public y: number;
  public selected: boolean;
  public value: string;
  public adjacentAtoms: Atom[];
  public dragging: boolean;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.selected = false;
    this.value = '';
    this.adjacentAtoms = [];
    this.dragging = false;
  }

  connect(child: Atom) {
    this.adjacentAtoms.push(child);
  }
}
