import Store from "./Store";
import {
  ENERGY_WITHDRAWN,
  CONTAINER_BUILT,
  ENERGY_STORED,
  PERIODIC_10_TICKS
} from "../constants";
import eventBus from "../EventBus";
import Decorators from "src/Decorators";

/**
 * Task to withdraw energy from containers
 *
 * @module task
 * @class Withdraw
 * @extends StoreTask
 */
@Decorators.memory()
export default class Withdraw extends Store {
  static updateTargetEvents: Array<string> = [ENERGY_STORED, PERIODIC_10_TICKS];
  static updatePotentialTargetEvents: Array<string> = [CONTAINER_BUILT];
  
  doTask(creep, target) {
    let returnValue = creep.withdraw(target, RESOURCE_ENERGY);
    if (returnValue === OK && target.store && target.store.energy === target.storeCapacity) {
      eventBus.fireEvent(ENERGY_WITHDRAWN, target);
    }
    return returnValue;
  }

  isTaskValid(creep, target) {
    return creep.carry.energy < creep.carryCapacity;
  }

  isTargetValid(target) {
    return target.store && target.store.energy > 0;
  }

  isAssignedTargetValid(target) {
    return (target.store.energy - this.targetsMap[target.id]) > 0;
  }
}
