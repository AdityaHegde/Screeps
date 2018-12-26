import Decorators from "src/Decorators";
import Building from "src/building/Building";
import BuildPlanner from "src/building/BuildPlanner";

@Decorators.memory()
export default class Container extends Building {
  static type: BuildableStructureConstant = STRUCTURE_CONTAINER;
  static impassable: boolean = false;

  @Decorators.inMemory()
  type: string = "container";

  getPlannedPositions(buildPlanner: BuildPlanner) {
    // TODO
    return [];
  }
}
