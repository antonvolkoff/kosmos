import { Atom, createAtom } from "./atom";
import { ApplicationState } from ".";

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

export function pack(state: ApplicationState): string {
  let result: PackObject = { graph: { nodes: {}, edges: [] } };
  let nodes = result.graph.nodes;
  let edges = result.graph.edges;

  Object.values(state.atoms).forEach(item => {
    nodes[item.id] = { x: item.x, y: item.y, value: item.value };
  });

  state.edges.forEach(edge => {
    edges.push({ source: edge.sourceId, target: edge.targetId });
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

  const edges = graph.edges.map(({ source, target}) => {
    return { sourceId: source, targetId: target };
  });

  return [atomsById, edges];
};
