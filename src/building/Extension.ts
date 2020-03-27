import Building from "src/building/Building";
import Decorators from "src/Decorators";
import BuildPlanner from "src/building/BuildPlanner";
import { Log } from "src/Logger";
import BuildingPlan from "src/building/BuildingPlan";

@Decorators.memory("buildings")
@Log
export default class Extension extends Building {
  static type: BuildableStructureConstant = STRUCTURE_EXTENSION;
  static impassable: boolean = true;
  static visualColor: string = "orange";

  @Decorators.inMemory()
  type: string = "extension";

  getPlannedPositions(buildPlanner: BuildPlanner): Array<BuildingPlan> {
    return this.addCenterToPlan(buildPlanner,
      this.formBuildingPlansRawPlans(buildPlanner, buildPlanner.extensionsPattern.extension));
  }
}
