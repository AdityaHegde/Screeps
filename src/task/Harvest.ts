import Decorators from "src/Decorators";
import { Task } from "src/task/Task";
import { Log } from "src/Logger";
import SourceWrapper from "src/SourceWrapper";
import CreepWrapper from "src/CreepWrapper";

/**
 * Task to harvest source
 *
 * @module task
 * @class HarvestTask
 * @extends BaseTask
 */
@Decorators.memory("tasks")
@Log
export default class Harvest extends Task {
  static taskName: string = "harvest";

  tick() {
    this.hasTarget = true;
  }

  getTarget(creep: CreepWrapper) {
    if (!creep.task.source) {
      this.controllerRoom.sourceManager.findAndClaimSource(creep);
    }
    return Game.getObjectById(creep.task.source);
  }

  updateTargetsMap() {
    // dummy
  }

  getTargets() {
    return [];
  }

  doTask(creep: CreepWrapper, target) {
    return creep.harvest(target);
  }

  isTaskValid(creep: CreepWrapper, target) {
    return creep.carry.energy < creep.carryCapacity;
  }

  targetIsReleased(creep: CreepWrapper, target) {
    SourceWrapper.getSourceWrapperById(target.id, this.controllerRoom).release(creep);
  }

  getTargetForMovement(creep: CreepWrapper, target) {
    return target.spaces[creep.task.space];
  }

  creepHasDied(creep: CreepWrapper) {
    super.creepHasDied(creep);
    if (creep.task) {
      let source: Source = Game.getObjectById(creep.task.source);
      if (source) {
        SourceWrapper.getSourceWrapperById(source.id, this.controllerRoom).release(creep);
      }
    }
  }

  targetsFilter(target: any): boolean {
    return true;
  }

  taskExecuted(creep: CreepWrapper, target: any) {}

  isTargetValid(target: any): boolean {
    return true;
  }

  targetIsClaimed(creep: CreepWrapper, target: any): void {}

  targetIsInvalid(creep: CreepWrapper, target: any): void {}

  isAssignedTargetValid(target: any): boolean {
    return true;
  }
}
