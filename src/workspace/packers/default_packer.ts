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
    return "";
  },

  unpack(data) {
    return [{}, []];
  },
};

export const { extensions, pack, unpack } = DefaultPacker;
export default DefaultPacker;
