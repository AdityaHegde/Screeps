import Building from "src/building/Building";
import Decorators from "src/Decorators";
import BuildPlanner from "src/building/BuildPlanner";

@Decorators.memory()
export default class Spawn extends Building {
  static type: BuildableStructureConstant = STRUCTURE_SPAWN;
  static impassable: boolean = false;

  @Decorators.inMemory()
  type: string = "spawn";

  getPlannedPositions(buildPlanner: BuildPlanner) {
    return buildPlanner.extensionsPattern.spawn;
  }
}
