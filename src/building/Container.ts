import Decorators from "src/Decorators";
import Building from "src/building/Building";
import BuildPlanner from "src/building/BuildPlanner";
import { Log } from "src/Logger";
import SourceWrapper from "src/SourceWrapper";
import MemorySet from "src/MemorySet";
import BuildingPlan from "src/building/BuildingPlan";

@Decorators.memory("buildings")
@Log
export default class Container extends Building {
  static type: BuildableStructureConstant = STRUCTURE_CONTAINER;
  static impassable: boolean = false;
  static visualColor: string = "orange";

  @Decorators.inMemory()
  type: string = "container";

  getPlannedPositions(buildPlanner: BuildPlanner): Array<BuildingPlan> {
    let plans: Array<BuildingPlan> = [...buildPlanner.controllerRoom.sourceManager.sources.keys().map((energySourceId) => {
      let energySource: SourceWrapper =
        buildPlanner.controllerRoom.sourceManager.sources.get(energySourceId);
      return energySource.source;
    }), buildPlanner.controllerRoom.room.controller].map((target) => {
      let containerPathInfo = buildPlanner.controllerRoom.pathManager.pathsInfo.get(target._toPath[0]);
      let containerPos = containerPathInfo.path[target._toPath[1]];
      return new BuildingPlan(`${buildPlanner.controllerRoom.name}_${containerPos.x}_${containerPos.y}`)
        .setPos(target._toPath[0], target._toPath[1], 0)
        .setXY(containerPos.x, containerPos.y);
    });

    return plans;
  }
}
