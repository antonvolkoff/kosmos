import Atom from "./atom";

let env = new Map();

export default function executor(atom: Atom): any {
  let result: any = "ERROR";

  switch (atom.value) {
    case (atom.value.match(/^[0-9]*$/) || {}).input:
      result = parseInt(atom.value);
      break;

    case (atom.value.match(/^"(?:\\.|[^\\"])*"$/) || {}).input:
      result =  atom.value.slice(1, atom.value.length-1).replace(/\\(.)/g, (_, c) => {
        return c === "n" ? "\n" : c;
      });

    default:
      if (env.has(atom.value)) {
        const fn = env.get(atom.value);
        return fn(atom);
      }

      break;
  }

  return result;
};

env.set("+", (atom: Atom) => {
  const values = atom.adjacentAtoms.map(childAtom => executor(childAtom));
  const sumFn = (sum: number, val: number) => sum += val;
  return values.reduce(sumFn, 0);
});

env.set("*", (atom: Atom) => {
  const values = atom.adjacentAtoms.map(childAtom => executor(childAtom));
  const multiplyFn = (total: number, val: number) => total *= val;
  return values.reduce(multiplyFn, 1);
});

env.set("print", (atom: Atom) => {
  const values = atom.adjacentAtoms.map(childAtom => executor(childAtom));
  return values.join(" ");
});
