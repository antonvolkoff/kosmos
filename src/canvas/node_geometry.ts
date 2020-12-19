import * as p5 from "p5";
import { Point, Rect, within } from "./geometry";

export interface NodeGeometry {
  center: Point;
  border: Rect;
  text: Point;
  dragPoints: Point[];
  value: string;
  draw(s: p5, selected: boolean): void;
  isWithin(mouse: Point): boolean;
  isWithinDragArea(mouse: Point): boolean;
}

const buildNodeGeometry = (atom: any): NodeGeometry => {
  const center = { x: atom.x, y: atom.y };

  const lines = atom.value.split("\n");
  const lengths = lines.map((line) => line.length);
  const valueLength = Math.max(...lengths);

  const fondWidth = 8.6;
  let width = 60;
  if (valueLength > 2) {
    width += (valueLength - 3) * fondWidth;
  }

  const height = 28 + (lines.length - 1) * 17;

  return {
    center,
    border: { x: atom.x - 20, y: atom.y - 14, width, height },
    text: { x: atom.x + 2, y: atom.y - 7.5 },
    dragPoints: [
      { x: atom.x - 12, y: atom.y - 7 },
      { x: atom.x - 7, y: atom.y - 7 },
      { x: atom.x - 12, y: atom.y },
      { x: atom.x - 7, y: atom.y },
      { x: atom.x - 12, y: atom.y + 7 },
      { x: atom.x - 7, y: atom.y + 7 },
    ],
    value: atom.value,

    draw(s, selected) {
      const fillColor = "#ffffff";
      const unselectedColor = "#999999";
      const selectedColor = "#79B8FF";
      const strokeWeight = 1.5;
      const borderRadius = 6;

      const strokeColor = selected ? selectedColor : unselectedColor;

      s.push();
      s.fill(s.color(fillColor));
      s.strokeWeight(strokeWeight);
      s.stroke(s.color(strokeColor));

      const border = this.border;
      // s.rect(border.x, border.y, border.width, border.height, borderRadius);
      s.pop();

      // if (selected) {
      //   s.push();
      //   s.fill(s.color(fillColor));
      //   s.stroke(s.color(strokeColor));
      //   this.dragPoints.forEach((p) => s.circle(p.x, p.y, 2));
      //   s.pop();
      // }

      // s.push();
      // s.fill(50);
      // s.strokeWeight(0);
      // s.textAlign(s.LEFT, s.TOP);
      // s.textFont("monospace", 14);
      // s.textLeading(17);
      // s.text(this.value, this.text.x, this.text.y);
      // s.pop();
    },

    isWithin(mouse) {
      return within(this.border, mouse);
    },

    isWithinDragArea(mouse) {
      const dragArea: Rect = { x: this.border.x, y: this.border.y, width: 20, height: 20 };
      return within(dragArea, mouse);
    },
  };
};

export { buildNodeGeometry };
