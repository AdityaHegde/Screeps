import Building from "src/building/Building";
import Utils from "src/Utils";
import Decorators from "src/Decorators";
import BuildPlanner from "src/building/BuildPlanner";
import { Log } from "src/Logger";
import BuildingPlan from "src/building/BuildingPlan";

@Decorators.memory("buildings")
@Log
export default class Wall extends Building {
  static type: BuildableStructureConstant = STRUCTURE_RAMPART;
  static impassable: boolean = false;

  @Decorators.inMemory()
  type: string = "wall";

  getPlannedPositions(buildPlanner: BuildPlanner): Array<BuildingPlan> {
    // TODO
    return this.addCenterToPlan(buildPlanner, []);
  }
}