import { Atom } from "./atom";

const sum = (atom: Atom): number => {
  const values = atom.adjacentAtoms.map(childAtom => executor(childAtom));
  const sumFn = (sum: number, val: number) => sum += val;
  return values.reduce(sumFn, 0);
};

const mult = (atom: Atom): number => {
  const values = atom.adjacentAtoms.map(childAtom => executor(childAtom));
  const multFn = (total: number, val: number) => total *= val;
  return values.reduce(multFn, 1);
};

export default function executor(atom: Atom): any {
  let result: any = "ERROR";

  switch (atom.value) {
    case "+":
      result = sum(atom);
      break;

    case "*":
      result = mult(atom);
      break;

    case (atom.value.match(/^[0-9]*$/) || {}).input:
      result = parseInt(atom.value);
    default:
      break;
  }

  return result;
};
