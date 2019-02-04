import PathPosObject from "src/path/PathPosObject";
import Decorators from "src/Decorators";
import { Log } from "src/Logger";
import BuildingPlan from "src/building/BuildingPlan";

@Decorators.memory("structures")
@Decorators.getInstanceById
@Log
export default class BuildingWrapper extends BuildingPlan {
  @Decorators.instanceInMemory()
  building: Structure;

  setBuilding(building: Structure) {
    this.building = building;

    return this;
  }
}
