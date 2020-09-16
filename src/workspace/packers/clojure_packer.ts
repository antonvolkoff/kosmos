import { parse } from "jsedn"
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

  let type = "";
  switch (typeof edn) {
    case "number":
      type = "number"
      break;
    case "string":
      type = "string";
      break;
    default:
      switch (edn.constructor.name) {
        case "Keyword":
          type = "keyword"
          break;
        case "List":
          type = "list"
          break;
        case "Symbol":
          type = "symbol"
          break;
        case "Tagged":
          type = "tagged"
          break;
        case "Vector":
          type = "vector"
          break;
        case "Set":
          type = "set"
          break;
        case "Map":
          type = "map"
          break;
        default:
          break;
      }
      break;
  }

  switch (type) {
    case "tagged":
      if (edn.tag().namespace == "kosmos") {
        edn.obj().each(item => g = traverse(item, g));
      }
      break;

    case "number":
      const numberId = g.addNode({ value: edn, type });
      if (parentId) g.addEdge(parentId, numberId);
      break;

    case "string":
      const stringId = g.addNode({ value: edn, type });
      if (parentId) g.addEdge(parentId, stringId);
      break;

    case "keyword":
      const keywordId = g.addNode({ value: edn.name, type });
      if (parentId) g.addEdge(parentId, keywordId);
      break;

    case "symbol":
      const symbolId = g.addNode({ value: edn.name, type });
      if (parentId) g.addEdge(parentId, symbolId);
      break;

    case "list":
      const listId = g.addNode({ value: "list", type });
      if (parentId) g.addEdge(parentId, listId);
      edn.val.forEach(ednItem => {
        g = traverse(ednItem, g, listId);
      })
      break;

    case "vector":
      const vectorId = g.addNode({ value: "vector", type });
      if (parentId) g.addEdge(parentId, vectorId);
      edn.val.forEach(ednItem => {
        g = traverse(ednItem, g, vectorId);
      })
      break;

    case "set":
      const setId = g.addNode({ value: "set", type: "set" });
      if (parentId) g.addEdge(parentId, setId);
      edn.val.forEach(ednItem => {
        g = traverse(ednItem, g, setId);
      })
      break;

    case "map":
      const mapId = g.addNode({ value: "hash-map", type });
      if (parentId) g.addEdge(parentId, mapId);
      for(let i = 0; i < edn.keys.length; i++) {
        g = traverse(edn.keys[i], g, mapId);
        g = traverse(edn.vals[i], g, mapId);
      }
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
  const ast = parse("#kosmos/root (" + data + ")");
  return traverse(ast);
}

const ClojurePacker: Packer = {
  extensions: [".clj", ".cljs", ".edn"],

  pack(nodes) {
    return [...nodes.map(translate), "\r\n"].join("");
  },

  unpack(data) {
    const ast = parse("#kosmos/root (" + data + ")");
    const graph = convertNodeValues(foldLists(traverse(ast)));
    return graph;
  },
};

export const { extensions, pack, unpack } = ClojurePacker;
export default ClojurePacker;
