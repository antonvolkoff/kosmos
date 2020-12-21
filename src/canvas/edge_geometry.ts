import * as p5 from "p5";
import { Line, Point, distance } from "./geometry";

interface EdgeGeometry {
  line: Line;
  draw(s: p5, selected: boolean): void;
  isWithin(mouse: Point): boolean;
}

const buildEdgeGeometry = (line: Line): EdgeGeometry => {
  const strokeWeight = 1.5;
  const strokeColor = 150;
  const strokeSelectedColor = "#79B8FF";

  return {
    line,

    draw(s, selected) {
      s.push();
      s.strokeWeight(strokeWeight);
      selected ? s.stroke(s.color(strokeSelectedColor)) : s.stroke(strokeColor);
      s.line(this.line.x1, this.line.y1, this.line.x2, this.line.y2);
      s.pop();
    },

    isWithin(mouse) {
      const start = { x: this.line.x1, y: this.line.y1 };
      const end = { x: this.line.x2, y: this.line.y2 };

      // Triangle sides
      const a = distance(start, mouse);
      const b = distance(mouse, end);
      const c = distance(start, end);

      // Perimeter and semi-perimeter
      const p = a + b + c;
      const s = p / 2;

      const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

      const height = 2 * area / c;

      return height < 5;
    },
  };
};

export { buildEdgeGeometry };
