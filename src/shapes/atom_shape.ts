import * as p5 from "p5";
import Atom from "../atom";
import { Point } from "../geometry";

export const ATOM_SIZE = 40;
export const BORDER_RADIUS = 40;
export const BASE_WIDTH = 60;
export const FONT_WIDTH = 8.6;

export default {
  width(atom: Atom) {
    let width = BASE_WIDTH;
    if (atom.value.length > 1) {
      width += (atom.value.length - 1) * FONT_WIDTH;
    }

    return width;
  },

  draw(s: p5, atom: Atom) {
    s.push();

    s.fill(s.color('#ffffff'));
    s.stroke(s.color('#999999'));
    s.strokeWeight(1.5);
    if (atom.selected) {
      s.stroke(s.color('#1DA159'));
      s.strokeWeight(2);
    }

    const width = this.width(atom);
    const height = 34;
    const x = atom.x - 20;
    const y = atom.y - (height / 2);

    s.rect(x, y, width, height, BORDER_RADIUS);
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
    const width = this.width(atom);

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

  withinDragArea(mouse: Point, atom: Atom): boolean {
    const leftBoundary = atom.x - 8;
    const rightBoundary = atom.x + 8;
    const topBoundary = atom.y + 8;
    const bottomBoundary = atom.y - 8;

    return (
      mouse.x > leftBoundary &&
      mouse.x < rightBoundary &&
      mouse.y > bottomBoundary &&
      mouse.y < topBoundary
    );
  },
};