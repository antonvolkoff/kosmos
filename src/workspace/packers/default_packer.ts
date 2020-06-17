export interface Node {
  value: string;
  depth: number;
  children: Node[];
};

export interface Packer {
  unpack(data: string): [any, any];
  pack(nodes: Node[]): string;
  extensions: string[];
};

const DefaultPacker: Packer = {
  extensions: [],

  pack(nodes) {
    return nodes.map((n) => n.value).join("\n");
  },

  unpack(data) {
    const nodes = {
      "1": { id: "1", x: 100, y: 100, value: data },
    };
    const edges = [];
    return [nodes, edges];
  },
};

export const { extensions, pack, unpack } = DefaultPacker;
export default DefaultPacker;
