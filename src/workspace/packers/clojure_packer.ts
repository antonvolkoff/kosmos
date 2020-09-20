import { Node, Packer } from "./default_packer";
import { createGraph, Graph } from "../graph";

const spacesPerDepth = 2;

const indent = (depth: number) => {
  return Array(depth * spacesPerDepth).fill(" ").join("");
};

function translate(node: Node): string {
  // Integer
  if (node.value.match(/^[0-9]*$/))
    return node.value;

  // String
  if (node.value.match(/^"(?:\\.|[^\\"])*"$/))
    return node.value;

  // Ref
  if (node.children.length == 0)
    return node.value;

  if (node.value == "vector") {
    const childValues = node.children.map(translate);
    return `[${childValues.join(" ")}]`;
  }

  const childValues = node.children.map(translate);
  return `\r\n${indent(node.depth)}(${[node.value, ...childValues].join(" ")})`;
}

function traverse(edn, graph = null, parentId = null): Graph {
  let g = graph ? graph : createGraph();

  if (Array.isArray(edn)) {
    edn.forEach(item => g = traverse(item, g))
    return g;
  }

  const type = edn.type;
  switch (type) {
    case "number":
      const numberId = g.addNode({ value: edn.form, type });
      if (parentId) g.addEdge(parentId, numberId);
      break;

    case "string":
      const stringId = g.addNode({ value: edn.form, type });
      if (parentId) g.addEdge(parentId, stringId);
      break;

    case "keyword":
      const keywordId = g.addNode({ value: edn.form, type });
      if (parentId) g.addEdge(parentId, keywordId);
      break;

    case "symbol":
      const symbolId = g.addNode({ value: edn.form, type });
      if (parentId) g.addEdge(parentId, symbolId);
      break;

    case "list":
      const listId = g.addNode({ value: "list", type });
      if (parentId) g.addEdge(parentId, listId);
      edn.form.forEach(ednItem => {
        g = traverse(ednItem, g, listId);
      })
      break;

    case "vector":
      const vectorId = g.addNode({ value: "vector", type });
      if (parentId) g.addEdge(parentId, vectorId);
      edn.form.forEach(ednItem => {
        g = traverse(ednItem, g, vectorId);
      })
      break;

    case "set":
      const setId = g.addNode({ value: "set", type: "set" });
      if (parentId) g.addEdge(parentId, setId);
      edn.form.forEach(ednItem => {
        g = traverse(ednItem, g, setId);
      })
      break;

    case "map":
      const mapId = g.addNode({ value: "hash-map", type });
      if (parentId) g.addEdge(parentId, mapId);

      edn.form.forEach(({ key, value }) => {
        g = traverse(key, g, mapId);
        g = traverse(value, g, mapId);
      });
      break;

    default:
      break;
  }

  return g;
}

function convertNodeValues(graph: Graph): Graph {
  const toValue = (node: any): string => {
    if (node.type == "string") {
      return `"${node.value}"`;
    } else {
      return node.value.toString();
    }
  }

  Object.keys(graph.nodes).forEach(nodeId => {
    graph.nodes[nodeId] = {
      ...graph.nodes[nodeId],
      value: toValue(graph.nodes[nodeId]),
    };
  });
  return graph;
}

function foldLists(g: Graph): Graph {
  Object.keys(g.nodes).forEach(nodeId => {
    const node = g.nodes[nodeId];
    const edges = g.edges[nodeId];

    if (node.type == "list" && edges.length > 0) {
      const [first, ...rest] = edges;
      rest.forEach(id => g.addEdge(first, id))
      g.inNeighbors(nodeId).forEach(id => g.addEdge(id, first));
      g.deleteNode(nodeId)
    }
  })

  return g;
}

export function read(data: string): Graph {
  const ast = window.kosmos.core.parse(data);
  return traverse(ast);
}

const ClojurePacker: Packer = {
  extensions: [".clj", ".cljs", ".edn"],

  pack(nodes) {
    return [...nodes.map(translate), "\r\n"].join("");
  },

  unpack(data) {
    const ast = window.kosmos.core.parse(data);
    console.log(ast);

    const graph = convertNodeValues(foldLists(traverse(ast)));
    return graph;
  },
};

export const { extensions, pack, unpack } = ClojurePacker;
export default ClojurePacker;
