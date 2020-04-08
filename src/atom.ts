export default class Atom {
  public id: string;
  public x: number;
  public y: number;
  public selected: boolean;
  public value: string;
  public adjacentAtoms: Atom[];
  public dragging: boolean;

  constructor(x: number, y: number, id: string = undefined, value = '') {
    this.id = id ? id : this.generateID();
    this.x = x;
    this.y = y;
    this.value = value;

    this.selected = false;
    this.adjacentAtoms = [];
    this.dragging = false;
  }

  connect(child: Atom) {
    this.adjacentAtoms.push(child);
  }

  score() {
    return this.x * this.y;
  }

  sortedAdjacentAtoms() {
    return this.adjacentAtoms.sort((a, b) => a.score() - b.score());
  }

  private generateID(): string {
    return Date.now().toString();
  }
};

type PackNode = {
  x: number;
  y: number;
  value: string;
};

type PackEdge = {
  source: string;
  target: string;
};

type PackObject = {
  graph: {
    nodes: {
      [id: string]: PackNode;
    };
    edges: PackEdge[];
  };
};

export function pack(atoms: Atom[]): object {
  let nodes = {};
  let edges = [];

  atoms.forEach(atom => {
    nodes[atom.id] = { x: atom.x, y: atom.y, value: atom.value };
    atom.adjacentAtoms.forEach(targetAtom => {
      edges.push({ source: atom.id, target: targetAtom.id });
    });
  });

  return {
    graph: { nodes, edges },
  };
};

export function unpack({ graph }: PackObject): Atom[] {
  let atomsById: { [id:string]: Atom } = {};

  Object.keys(graph.nodes).forEach(id => {
    const { x, y, value } = graph.nodes[id];
    atomsById[id] = new Atom(x, y, id, value);
  });

  graph.edges.forEach(({ source, target}) => {
    const sourceAtom = atomsById[source];
    const targetAtom = atomsById[target];
    sourceAtom.connect(targetAtom);
  });

  return Object.values(atomsById);
};
