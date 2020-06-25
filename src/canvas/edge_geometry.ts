import * as p5 from "p5";
import { Line } from "./geometry";

interface EdgeGeometry {
  line: Line;
  draw(s: p5);
}

const buildEdgeGeometry = (line: Line): EdgeGeometry => {
  const strokeWeight = 1.5;
  const strokeColor = 150;

  return {
    line,

    draw(s) {
      s.push();
      s.strokeWeight(strokeWeight);
      s.stroke(strokeColor);
      s.line(this.line.x1, this.line.y1, this.line.x2, this.line.y2);
      s.pop();
    },
  };
};

export { buildEdgeGeometry };
