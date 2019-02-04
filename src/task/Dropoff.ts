import { Task } from "./Task";
import { CREEP_CREATED, EXTENSION_BUILT } from "../constants";
import * as _ from "lodash";
import Decorators from "src/Decorators";
import { Log } from "src/Logger";
import eventBus from "src/EventBus";
import CreepWrapper from "src/CreepWrapper";

/**
 * Task to drop off energy to spawn, extension or other structures that take energy (TODO)
 *
 * @module task
 * @class DropOffTask
 * @extends BaseTask
 */
@Decorators.memory("tasks")
@Log
export default class Dropoff extends Task {
  static updateTargetEvents: Array<string> = [CREEP_CREATED];
  static updatePotentialTargetEvents: Array<string> = [EXTENSION_BUILT];
  static taskName: string = "dropoff";

  @Decorators.inMemory()
  potentialTargets: any;

  static initClass() {
    Task.initClass.call(this);
    this.updatePotentialTargetEvents.forEach((eventListener) => {
      eventBus.subscribe(eventListener, "updatePotentialTargets", "tasks." + this.taskName);
    });
  }

  init(): void {
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

  doTask(creep: CreepWrapper, target) {
    return creep.transfer(target, RESOURCE_ENERGY);
  }

  isTaskValid(creep: CreepWrapper, target) {
    return creep.carry.energy > 0;
  }

  isTargetValid(target) {
    return target.energy < target.energyCapacity;
  }

  targetIsClaimed(creep: CreepWrapper, target) {
    this.targetsMap[target.id] += creep.carry.energy;
  }

  targetIsReleased(creep: CreepWrapper, target) {
    this.targetsMap[target.id] -= creep.carry.energy;
  }

  isAssignedTargetValid(target) {
    return ((target.energyCapacity - target.energy) - this.targetsMap[target.id]) > 0;
  }

  tick(): void {}

  taskExecuted(creep: any, target: any) {}
  
  targetIsInvalid(creep: any, target: any): void {}
}