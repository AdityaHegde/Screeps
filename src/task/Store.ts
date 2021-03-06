import Dropoff from "./Dropoff";
import {
  HARVESTER_STORAGE,
  ENERGY_STORED,
  CONTAINER_BUILT,
  ENERGY_WITHDRAWN
} from "../constants";
import eventBus from "../EventBus";
import Decorators from "src/Decorators";
import { Log } from "src/Logger";
import CreepWrapper from "src/CreepWrapper";

/**
 * Store in containers
 *
 * @module task
 * @class StoreTask
 * @extends DropOffTask
 */
@Decorators.memory("tasks")
@Log
export default class Store extends Dropoff {
  static taskName: string = "store";
  static updateTargetEvents: Array<string> = [ENERGY_WITHDRAWN];
  static updatePotentialTargetEvents: Array<string> = [CONTAINER_BUILT];

  doTask(creep: CreepWrapper, target) {
    let returnValue = creep.transfer(target, RESOURCE_ENERGY);
    if (returnValue === OK && target.store && target.store.energy === 0) {
      eventBus.fireEvent(ENERGY_STORED, target);
    }
    return returnValue;
  }

  potentialTargetsFilter(structure) {
    return structure.structureType === STRUCTURE_CONTAINER &&
      structure.label === HARVESTER_STORAGE;
  }
}
