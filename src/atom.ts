interface Atom {
  id: number;
  x: number;
  y: number;
  selected: boolean;
  value: string;
};

let id = 0;

const create = (x: number, y: number): Atom => {
  return { id: id++, x: x, y: y, selected: false, value: '' };
};

export { Atom, create }