import { Packer, Node } from "./default_packer";
import * as dot from "graphlib-dot";
import { Graph } from "graphlib";

function appendToGraph(
  graph: Graph, nodes: Node[], parent: Node
): Graph {
  nodes.forEach((node) => {
    graph.setNode(node.value);
    if (parent) graph.setEdge(parent.value, node.value);

    graph = appendToGraph(graph, node.children, node);
  });
  return graph;
}

const DotPacker: Packer = {
  extensions: [".dot"],

  pack(nodes) {
    return dot.write(appendToGraph(new Graph(), nodes, null));
  },

  unpack(data) {
    const graph = dot.read(data);

    const nodes =
      graph.nodes()
      .map((value) => {
        const props = graph.node(value);
        return { id: value, value: props.label || value };
      }).reduce((prev, curr) => {
        prev[curr.id] = curr;
        return prev;
      }, {});

    const edges = graph.edges().map(({v, w}) => (
      { sourceId: v, targetId: w }
    ));
    return [nodes, edges];
  },
};

export const { extensions, pack, unpack } = DotPacker;
export default DotPacker;
