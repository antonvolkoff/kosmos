import { Atom, createAtom } from "./atom";

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

export function pack(items: Atom[]): string {
  let result: PackObject = { graph: { nodes: {}, edges: [] } };
  let nodes = result.graph.nodes;
  let edges = result.graph.edges;

  items.forEach(item => {
    nodes[item.id] = { x: item.x, y: item.y, value: item.value };
    item.outgoing.forEach(child => {
      edges.push({ source: item.id, target: child.id });
    });
  });

  return JSON.stringify(result);
};

export function unpack(data: string): [any, any] {
  const { graph }: PackObject = JSON.parse(data);

  let atomsById: { [id:string]: Atom } = {};

  Object.keys(graph.nodes).forEach(id => {
    const { x, y, value } = graph.nodes[id];
    let atom = createAtom(x, y);
    atom.id = id;
    atom.value = value;
    atomsById[id] = atom;
  });

  graph.edges.forEach(({ source, target}) => {
    const sourceAtom = atomsById[source];
    const targetAtom = atomsById[target];
    sourceAtom.outgoing.push(targetAtom);
    targetAtom.incoming.push(sourceAtom);
  });

  const edges = graph.edges.map(({ source, target}) => {
    return { sourceId: source, targetId: target };
  });

  return [atomsById, edges];
};
