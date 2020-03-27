import Decorators from "src/Decorators";
import PathPosObject from "src/path/PathPosObject";

@Decorators.memory("buildingPlans")
export default class BuildingPlan extends PathPosObject {
  @Decorators.inMemory(() => 0)
  x: number;

  @Decorators.inMemory(() => 0)
  y: number;

  setXY(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }
}
