import Dropoff from "./Dropoff";
import {
  UPGRADER_STORAGE,
  ENERGY_WITHDRAWN,
  TOWER_USED_ENERGY,
  CONTAINER_BUILT,
  TOWER_BUILT
} from "../constants";
import Decorators from "src/Decorators";

@Decorators.memory()
export default class Supply extends Dropoff {
  static updateTargetEvents = [ENERGY_WITHDRAWN, TOWER_USED_ENERGY];
  static updatePotentialTargetEvents = [CONTAINER_BUILT, TOWER_BUILT];

  potentialTargetsFilter(structure) {
    return (structure.structureType === STRUCTURE_CONTAINER && structure.label === UPGRADER_STORAGE) ||
        structure.structureType === STRUCTURE_TOWER;
  }
}
