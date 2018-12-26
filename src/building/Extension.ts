import Building from "src/building/Building";
import { CONSTRUCTION_COMPLETED } from "src/constants";
import Utils from "src/Utils";
import Decorators from "src/Decorators";
import * as _ from "lodash";
import BuildPlanner from "src/building/BuildPlanner";

@Decorators.memory()
export default class Extension extends Building {
  static type: BuildableStructureConstant = STRUCTURE_EXTENSION;
  static impassable: boolean = false;

  @Decorators.inMemory()
  type: string = "extension";

  getPlannedPositions(buildPlanner: BuildPlanner) {
    return buildPlanner.extensionsPattern.extension;
  }
}
