import PathPosObject from "src/path/PathPosObject";
import Decorators from "src/Decorators";

@Decorators.memory()
export default class BuildingWrapper extends PathPosObject {
  id: string;

  @Decorators.instanceInMemory()
  building: Structure;

  constructor(building: Structure) {
    super();

    this.id = building.id;
    this.building = building;
  }
}
