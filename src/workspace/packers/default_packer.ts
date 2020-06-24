import { Graph, createGraph } from "../graph";

export interface Node {
  value: string;
  depth?: number;
  children: Node[];
};

export interface Packer {
  unpack(data: string): Graph;
  pack(nodes: Node[]): string;
  extensions: string[];
};

const DefaultPacker: Packer = {
  extensions: [],

  pack(nodes) {
    return nodes.map((n) => n.value).join("\n");
  },

  unpack(data) {
    const graph = createGraph();
    graph.addNode({ value: data });
    return graph;
  },
};

export const { extensions, pack, unpack } = DefaultPacker;
export default DefaultPacker;
