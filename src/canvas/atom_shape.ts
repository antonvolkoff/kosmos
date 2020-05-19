import * as p5 from "p5";
import { Atom } from "../store/atom";
import { Point } from "./geometry";

export const ATOM_SIZE = 40;
export const BORDER_RADIUS = 6;
export const BASE_WIDTH = 60;
export const FONT_WIDTH = 8.6;

interface DrawableAtom {
  x: number;
  y: number;
  value: string;
  selected: boolean;
}

export default {
  width(atom: Atom) {
    let width = BASE_WIDTH;
    if (atom.value.length > 2) {
      width += (atom.value.length - 3) * FONT_WIDTH;
    }

    return width;
  },

  draw(s: p5, atom: DrawableAtom) {
    s.push();

    s.fill(s.color('#ffffff'));
    s.stroke(s.color('#999999'));
    s.strokeWeight(1.5);

    const width = this.width(atom);
    const height = 28;
    const x = atom.x - 20;
    const y = atom.y - (height / 2);

    if (atom.selected) {
      s.stroke(s.color('#79B8FF'));
    }

    s.rect(x, y, width, height, BORDER_RADIUS);

    if (atom.selected) {
      s.circle(atom.x - 12, atom.y - 7, 2);
      s.circle(atom.x - 7, atom.y - 7, 2);

      s.circle(atom.x - 12, atom.y, 2);
      s.circle(atom.x - 7, atom.y, 2);

      s.circle(atom.x - 12, atom.y + 7, 2);
      s.circle(atom.x - 7, atom.y + 7, 2);
    }

    s.push();
    {
      s.fill(50);
      s.strokeWeight(0);
      s.textAlign(s.LEFT, s.CENTER);
      s.textFont("monospace", 14);
      s.text(atom.value, atom.x + 2, atom.y);
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
    const leftBoundary = atom.x - 16;
    const rightBoundary = atom.x;
    const topBoundary = atom.y + 16;
    const bottomBoundary = atom.y - 16;

    return (
      mouse.x > leftBoundary &&
      mouse.x < rightBoundary &&
      mouse.y > bottomBoundary &&
      mouse.y < topBoundary
    );
  },
};