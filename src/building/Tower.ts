import Decorators from "src/Decorators";
import BuildPlanner from "src/building/BuildPlanner";
import Building from "src/building/Building";
import { Log } from "src/Logger";
import BuildingPlan from "src/building/BuildingPlan";

@Decorators.memory("buildings")
@Log
export default class Tower extends Building {
  static type: BuildableStructureConstant = STRUCTURE_TOWER;
  static impassable: boolean = true;
  static visualColor: string = "red";

  @Decorators.inMemory()
  type: string = "tower";

  getPlannedPositions(buildPlanner: BuildPlanner): Array<BuildingPlan> {
    let plans = [];
    plans.push(...(buildPlanner.extensionsPattern.tower || []));
    plans.push(...(buildPlanner.labsPattern.tower || []));
    return this.addCenterToPlan(buildPlanner,
      this.formBuildingPlansRawPlans(buildPlanner, plans));
  }
}
