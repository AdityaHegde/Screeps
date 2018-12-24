import Decorators from "src/Decorators";
import { Task } from "src/task/Task";

/**
 * Task to harvest source
 *
 * @module task
 * @class HarvestTask
 * @extends BaseTask
 */
@Decorators.memory()
export default class Harvest extends Task {
  init(): void {
    throw new Error("Method not implemented.");
  }

  tick() {
    this.hasTarget = true;
  }

  getTarget(creep) {
    if (!creep.task.source) {
      // this.controllerRoom.findAndClaimSource(creep);
    }
    return Game.getObjectById(creep.task.source);
  }

  updateTargetsMap() {
    // dummy
  }

  getTargets() {
    return [];
  }

  doTask(creep, target) {
    return creep.harvest(target);
  }

  isTaskValid(creep, target) {
    return creep.carry.energy < creep.carryCapacity;
  }

  targetIsReleased(creep, target) {
    target.release(creep);
  }

  getTargetForMovement(creep, target) {
    return target.spaces[creep.task.space];
  }

  creepHasDied(creep) {
    super.creepHasDied(creep);
    if (creep.task) {
      let source = Game.getObjectById(creep.task.source);
      if (source) {
        // source.release(creep);
      }
    }
  }

  targetsFilter(target: any): boolean {
    return true;
  }

  taskExecuted(creep: any, target: any) {}

  isTargetValid(target: any): boolean {
    return true;
  }

  targetIsClaimed(creep: any, target: any): void {}

  targetIsInvalid(creep: any, target: any): void {}

  isAssignedTargetValid(target: any): boolean {
    return true;
  }
}
