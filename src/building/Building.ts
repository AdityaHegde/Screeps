import BaseClass from "../BaseClass";
import Decorators from "../Decorators";
import { CONSTRUCTION_COMPLETED, CONSTRUCTION_SCHEDULED, PARALLEL_BUILD_COUNT } from "src/constants";
import BuildingWrapper from "src/building/BuildingWrapper";
import eventBus from "src/EventBus";
import BuildPlanner from "src/building/BuildPlanner";

@Decorators.memory()
export default abstract class Building extends BaseClass {
  static type: BuildableStructureConstant;
  static impassable: boolean = true;

  @Decorators.inMemory()
  type: string;

  paths: Array<any> = [];

  // TODO: handle rebuild
  @Decorators.inMemory()
  planned: Array<Array<number>> = [];

  @Decorators.inMemory()
  built: Array<BuildingWrapper> = [];

  @Decorators.inMemory()
  repair: Array<BuildingWrapper> = [];

  abstract getPlannedPositions(buildPlanner: BuildPlanner);

  plan(buildPlanner: BuildPlanner) {
    this.planned = this.getPlannedPositions(buildPlanner);
    if (this.constructor["impassable"]) {
      this.planned.forEach((plannedSite) => {
        buildPlanner.costMatrix.set(plannedSite[0], plannedSite[1], 255);
      });
    }
  }

  build(buildPlanner: BuildPlanner): boolean {
    let c = 0;
    if (this.planned.length === 0) {
      // return true if this type of structure was finished before
      return true;
    }

    // limit the operations to 5 (?)
    while (this.planned.length > 0 && c < PARALLEL_BUILD_COUNT) {
      let pos = this.planned[this.planned.length - 1];

      let returnValue = this.buildAt(buildPlanner, pos[0], pos[1]);

      // if max sites has been reached or if RCL is not high enough, return
      if (returnValue === ERR_FULL || returnValue === ERR_RCL_NOT_ENOUGH) {
        // return true if RCL is not high enough, used to skip building a type for the current RCL
        return returnValue === ERR_RCL_NOT_ENOUGH;
      }

      eventBus.fireDelayedEvent(CONSTRUCTION_SCHEDULED, buildPlanner.controllerRoom, pos[0], pos[1]);

      this.planned.pop();
    }

    if (this.planned.length === 0) {
      eventBus.fireEvent(CONSTRUCTION_COMPLETED, buildPlanner.controllerRoom, this.constructor["type"]);
    }

    // build only one type at a time
    return false;
  }

  buildAt(buildPlanner: BuildPlanner, x, y) {
    return buildPlanner.controllerRoom.room.createConstructionSite(x, y, this.constructor["type"]);
  }

  isBuilt(buildPlanner: BuildPlanner, structure) {
    this.built.push(new BuildingWrapper(structure));
  }
}
