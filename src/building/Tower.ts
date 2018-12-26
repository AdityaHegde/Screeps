import Decorators from "src/Decorators";
import * as _ from "lodash";
import BuildPlanner from "src/building/BuildPlanner";
import Building from "src/building/Building";

@Decorators.memory()
export default class Tower extends Building {
  static type: BuildableStructureConstant = STRUCTURE_TOWER;
  static impassable: boolean = false;

  @Decorators.inMemory()
  type: string = "tower";

  getPlannedPositions(buildPlanner: BuildPlanner) {
    return _.concat(buildPlanner.extensionsPattern.tower || [], buildPlanner.labsPattern.tower || []);
  }
}
