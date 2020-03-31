import * as util from 'util';
import * as repl from "nrepl-client";

import Atom from "./atom";

const replClient = repl.connect({ port: 58597 });
replClient.once('connect', () => {
  console.log("Connected to REPL");
});

const evalPromise = util.promisify(replClient.eval);

let env = new Map();

const collectAtomValues = (atom: Atom) => {
  return atom.sortedAdjacentAtoms().map(child => child.value);
}

const compile = (atom: Atom): string => {
  // Integer
  if (atom.value.match(/^[0-9]*$/))
    return atom.value;

  // String
  if (atom.value.match(/^"(?:\\.|[^\\"])*"$/))
    return atom.value;

  // Ref
  if (atom.adjacentAtoms.length == 0)
    return atom.value;

  const childValues = atom.sortedAdjacentAtoms().map(child => compile(child));

  return `(${[atom.value, ...childValues].join(" ")})`;
};

export default async function executor(atom: Atom): Promise<string> {
  const evalString = compile(atom);
  console.log("Compiled:", evalString);
  const result = await evalPromise(evalString);
  console.log(result);
  return result[0].out || result[0].value;
};
