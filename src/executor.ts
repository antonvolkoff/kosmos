import Atom from "./atom";

const sum = (atom: Atom): number => {
  const values = atom.adjacentAtoms.map(childAtom => executor(childAtom));
  const sumFn = (sum: number, val: number) => sum += val;
  return values.reduce(sumFn, 0);
};

const multiply = (atom: Atom): number => {
  const values = atom.adjacentAtoms.map(childAtom => executor(childAtom));
  const multiplyFn = (total: number, val: number) => total *= val;
  return values.reduce(multiplyFn, 1);
};

const println = (atom: Atom): string => {
  const values = atom.adjacentAtoms.map(childAtom => executor(childAtom));
  return values.join(" ");
};

export default function executor(atom: Atom): any {
  let result: any = "ERROR";

  switch (atom.value) {
    case "+":
      result = sum(atom);
      break;

    case "*":
      result = multiply(atom);
      break;

    case "print":
      result = println(atom);
      break;

    case (atom.value.match(/^[0-9]*$/) || {}).input:
      result = parseInt(atom.value);
      break;

    case (atom.value.match(/^"(?:\\.|[^\\"])*"$/) || {}).input:
      return atom.value.slice(1, atom.value.length-1).replace(/\\(.)/g, (_, c) => {
        return c === "n" ? "\n" : c;
      });

    default:
      break;
  }

  return result;
};
