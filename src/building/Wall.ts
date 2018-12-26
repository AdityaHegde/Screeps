import Building from "src/building/Building";
import Utils from "src/Utils";
import Decorators from "src/Decorators";
import BuildPlanner from "src/building/BuildPlanner";

@Decorators.memory()
export default class Wall extends Building {
  static type: BuildableStructureConstant = STRUCTURE_RAMPART;

  @Decorators.inMemory()
  type: string = "wall";

  getPlannedPositions(buildPlanner: BuildPlanner) {
    // TODO
    return buildPlanner.wallPattern.wall;
  }
}