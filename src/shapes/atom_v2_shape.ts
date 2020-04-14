import * as p5 from "p5";
import Atom from "../atom";
import { Point } from "../geometry";

export const ATOM_SIZE = 40;
export const BORDER_RADIUS = 40;

export default {
  draw(s: p5, atom: Atom) {
    s.push();

    s.fill(s.color('#ffffff'));
    s.stroke(s.color('#999999'));
    s.strokeWeight(1.25);
    if (atom.selected) {
      s.stroke(s.color('#1DA159'));
      s.strokeWeight(2);
    }

    const x = atom.x - 20;
    const y = atom.y - 20;
    const width = 60;
    const height = 40;

    let widthExtension = 0;
    if (atom.value.length > 1) {
      widthExtension = (atom.value.length - 1) * 8.6;
    }

    s.rect(x, y, width + widthExtension, height, BORDER_RADIUS);
    s.circle(atom.x, atom.y, 16);

    s.push();
    {
      s.fill(50);
      s.strokeWeight(0);
      s.textAlign(s.LEFT, s.CENTER);
      s.textFont("monospace", 14);
      s.text(atom.value, atom.x + 16, atom.y);
    }
    s.pop();

    s.pop();
  },

  within(mouse: Point, atom: Atom): boolean {
    let width = 60;
    if (atom.value.length > 1) {
      width += (atom.value.length - 1) * 8.6;
    }

    const leftBoundary = atom.x - 20;
    const rightBoundary = atom.x + width - 20;
    const topBoundary = atom.y + 20;
    const bottomBoundary = atom.y - 20;

    return (
      mouse.x > leftBoundary &&
      mouse.x < rightBoundary &&
      mouse.y > bottomBoundary &&
      mouse.y < topBoundary
    );
  },
};