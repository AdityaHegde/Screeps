import { Task } from "./Task";
import { STRUCURE_BUILT, CONSTRUCTION_SITE_ADDED } from "../constants";
import Utils from "../Utils";
import eventBus from "../EventBus";
import Decorators from "src/Decorators";

/**
 * Task to drop off energy to spawn, extension or other structures that take energy (TODO)
 *
 * @module task
 * @class BuildTask
 * @extends BaseTask
 */
@Decorators.memory()
export default class Build extends Task {
  static updateTargetEvents: Array<string> = [CONSTRUCTION_SITE_ADDED];

  init() {}

  tick() {}

  doTask(creep, target) {
    creep.task.targetType = target.structureType;
    creep.task.targetPos = {
      x: target.pos.x,
      y: target.pos.y
    };
    return creep.build(target);
  }

  targetIsInvalid(creep, target) {
    let newTarget = target || this.controllerRoom.room.lookForAt(LOOK_STRUCTURES, creep.task.targetPos.x, creep.task.targetPos.y)[0];
    if (newTarget && creep.task.targetType) {
      eventBus.fireEvent(STRUCURE_BUILT, newTarget);
    }
  }

  taskStarted(creep) {
    super.taskStarted(creep);
    let source: Source = Game.getObjectById(creep.task.source);
    if (source) {
      var dir = Utils.rotateDirection(Utils.getDirectionBetweenPos(creep.pos, source.pos), 4);
      creep.move(dir);
    }
  }

  isTaskValid(creep, target) {
    return creep.carry.energy > 0;
  }

  targetIsClaimed(creep, target) {
    // TODO consider boosted parts
    this.targetsMap[target.id] += creep.carry.energy;
  }

  targetIsReleased(creep, target) {
    // TODO consider boosted parts
    this.targetsMap[target.id] -= creep.carry.energy;
  }

  taskExecuted(creep: any, target: any) {}

  isAssignedTargetValid(target) {
    return target && (target.progressTotal - this.targetsMap[target.id]) > 0;
  }

  getTargets() {
    return this.controllerRoom.room.find(FIND_CONSTRUCTION_SITES).map((target) => target.id);
  }

  targetsFilter(target: any): boolean {
    return true;
  }

  isTargetValid(target: any): boolean {
    return true;
  }
}