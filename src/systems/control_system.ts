import { System } from "ecsy";
import Position from "../components/position";
import Mouse from "../components/mouse";

export default class ControlSystem extends System {
  execute() {
    if (!this.hasMouse()) return;

    const mouseData = this.queries.mouses.results[0].getComponents();
    if (mouseData['Mouse'].state == 'pressed') {
      console.log('pressed');
    }
  }

  private hasMouse(): boolean {
    return this.queries.mouses.results.length != 0;
  }
};

ControlSystem.queries = {
  mouses: { components: [Position, Mouse] },
};
