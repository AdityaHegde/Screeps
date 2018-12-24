import { Task } from "./Task";
import { CREEP_CREATED, EXTENSION_BUILT } from "../constants";
import * as _ from "lodash";
import Decorators from "src/Decorators";

/**
 * Task to drop off energy to spawn, extension or other structures that take energy (TODO)
 *
 * @module task
 * @class DropOffTask
 * @extends BaseTask
 */
@Decorators.memory()
export default class Dropoff extends Task {
  static updateTargetEvents: Array<string> = [CREEP_CREATED];
  static updatePotentialTargetEvents: Array<string> = [EXTENSION_BUILT];

  // static initClass: function (room) {
  //   BaseTask.init.call(this, room);
  //   this.UPDATE_POTENTIAL_TARGETS_EVENTS.forEach((eventListener) => {
  //     eventBus.subscribe(eventListener, "updatePotentialTargets", "tasksInfo." + this.TASK_NAME);
  //   });
  // }

  potentialTargets: any;

  init(): void {
    // this.room = room;
    this.potentialTargets = this.getPotentialTargets();
    this.updateTargetsMap(1);
  }

  updatePotentialTargets(newPotentialTargets) {
    this.potentialTargets.push(...newPotentialTargets.filter((structure) => {
      return this.potentialTargetsFilter(structure);
    }).map(newPotentialTarget => newPotentialTarget.id));
    this.potentialTargets = _.uniq(this.potentialTargets);
    this.updateTargetsMap(1);
  }

  getPotentialTargets() {
    return this.controllerRoom.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return this.potentialTargetsFilter(structure);
      }
    }).map((structure) => structure.id);
  }

  potentialTargetsFilter(structure) {
    return structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN;
  }

  getTargets() {
    return this.potentialTargets.filter((potentialTarget) => {
      return this.isTargetValid(Game.getObjectById(potentialTarget));
    });
  }

  targetsFilter(structure) {
    return this.potentialTargetsFilter(structure);
  }

  doTask(creep, target) {
    return creep.transfer(target, RESOURCE_ENERGY);
  }

  isTaskValid(creep, target) {
    return creep.carry.energy > 0;
  }

  isTargetValid(target) {
    return target.canStoreEnergy();
  }

  targetIsClaimed(creep, target) {
    this.targetsMap[target.id] += creep.carry.energy;
  }

  targetIsReleased(creep, target) {
    this.targetsMap[target.id] -= creep.carry.energy;
  }

  isAssignedTargetValid(target) {
    return (target.getRemainingEnergyCapacity() - this.targetsMap[target.id]) > 0;
  }

  tick(): void {}

  taskExecuted(creep: any, target: any) {}
  
  targetIsInvalid(creep: any, target: any): void {}
}