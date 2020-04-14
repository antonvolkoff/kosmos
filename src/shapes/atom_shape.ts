import * as p5 from "p5";
import Atom from "../atom";
import { Point } from "../geometry";

export const ATOM_SIZE = 50;

export default {
  draw(s: p5, atom: Atom) {
    if (atom.selected) {
      s.strokeWeight(3);
      s.stroke(s.color('#1DA159'));
    } else {
      s.strokeWeight(2);
      s.stroke(150);
    }

    const diameter = atom.dragging ? ATOM_SIZE * 1.2 : ATOM_SIZE;
    s.circle(atom.x, atom.y, diameter);

    s.push();
    s.fill(50);
    s.strokeWeight(0);
    s.textAlign(s.CENTER, s.CENTER);
    s.textFont("monospace", 14);
    s.text(atom.value, atom.x, atom.y);
    s.pop();
  },

  within(mouse: Point, atom: Atom): boolean {
    const leftBoundary = atom.x - (ATOM_SIZE / 2);
    const rightBoundary = atom.x + (ATOM_SIZE / 2);
    const topBoundary = atom.y + (ATOM_SIZE / 2);
    const bottomBoundary = atom.y - (ATOM_SIZE / 2);

    return (
      mouse.x > leftBoundary &&
      mouse.x < rightBoundary &&
      mouse.y > bottomBoundary &&
      mouse.y < topBoundary
    );
  },
};
