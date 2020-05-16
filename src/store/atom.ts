export interface Atom {
  id: string;
  x: number;
  y: number;
  value: string;
}

const generateId = (): string => Date.now().toString();

export const createAtom = (x = 0, y = 0): Atom => {
  return { id: generateId(), x, y, value: "" };
};

