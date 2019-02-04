import Building from "src/building/Building";
import Decorators from "src/Decorators";
import BuildPlanner from "src/building/BuildPlanner";
import { Log } from "src/Logger";
import BuildingPlan from "src/building/BuildingPlan";

@Decorators.memory("buildings")
@Log
export default class SpawnBuilding extends Building {
  static type: BuildableStructureConstant = STRUCTURE_SPAWN;
  static impassable: boolean = false;

  @Decorators.inMemory()
  type: string = "spawn";

  getPlannedPositions(buildPlanner: BuildPlanner): Array<BuildingPlan> {
    return this.addCenterToPlan(buildPlanner,
      this.formBuildingPlansRawPlans(buildPlanner, buildPlanner.extensionsPattern.spawn));
  }
}
