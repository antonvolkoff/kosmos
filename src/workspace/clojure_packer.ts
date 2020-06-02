import { parse, encodeJson } from "jsedn"
import { ValueNode } from "../store/defaultReducer";
import { createGraph, Graph } from "./graph";

function translate(node: ValueNode): string {
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
    return `[${childValues.join(" ")}]`
  }

  const childValues = node.children.map(translate);

  return `(${[node.value, ...childValues].join(" ")})`;
}

export function pack(nodes: ValueNode[]): string {
  return nodes.map(translate).join("\n") + "\n";
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
      x: 0,
      y: 0,
      id: nodeId,
    };
  });
  return graph;
}

function assignPlace(graph: Graph): Graph {
  const walk = (ids: string[], row: number, col: number): number => {
    for(let i = 0; i < ids.length; i++) {
      const id = ids[i];
      row = row + 1;
      graph.nodes[id].col = col;
      graph.nodes[id].row = row;

      if (graph.outNeighbors(id).length > 0)
        row = walk(graph.outNeighbors(id), row - 1, col + 1);
    }
    return row;
  }

  walk(graph.rootNodes(), 0, 0);

  Object.values(graph.nodes).forEach((node: any) => {
    node.x = node.col * 100 + 100;
    node.y = node.row * 40 + 100;
  });

  return graph;
}

function getEdgesList(graph: Graph): any[] {
  let edges = [];

  Object.keys(graph.edges).forEach(sourceId => {
    if (graph.edges[sourceId].length == 0)  return;

    graph.edges[sourceId].forEach(targetId => {
      edges.push({ sourceId, targetId })
    })
  });

  return edges;
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

export function unpack(data: string): [any, any] {
  const ast = parse("#kosmos/root (" + data + ")");
  const graph = traverse(ast);
  const simpleGraph = foldLists(graph);
  const nodes = assignPlace(convertNodeValues(simpleGraph)).nodes;
  const edges = getEdgesList(simpleGraph);
  return [nodes, edges];
}
