import { Atom } from "./atom";
import { ValueNode } from "./defaultReducer";

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

  const childValues = node.children.map(translate);

  return `(${[node.value, ...childValues].join(" ")})`;
}

export function pack(nodes: ValueNode[]): string {
  return nodes.map(translate).join("\n") + "\n";
}

export function unpack(data: string): Atom[] {
  return [];
}
