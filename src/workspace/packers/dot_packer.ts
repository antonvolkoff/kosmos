import { Packer, Node } from "./default_packer";
import * as dot from "graphlib-dot";
import { Graph as Graphlib } from "graphlib";
import { createGraph } from "../graph";

function appendToGraph(
  graph: Graphlib, nodes: Node[], parent: Node
): Graphlib {
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
    return dot.write(appendToGraph(new Graphlib(), nodes, null));
  },

  unpack(data) {
    const dotGraph = dot.read(data);
    const graph = createGraph();

    dotGraph.nodes().forEach((id) => {
      graph.addNode({ value: dotGraph.node(id).label || id }, id);
    });

    dotGraph.edges().forEach(({ v, w }) => graph.addEdge(v, w));

    return graph;
  },
};

export const { extensions, pack, unpack } = DotPacker;
export default DotPacker;
