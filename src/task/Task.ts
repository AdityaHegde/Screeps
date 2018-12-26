import BaseClass from "../BaseClass";
import Decorators from "../Decorators";
import { ERR_INVALID_TASK, CREEP_REACHED_TARGET } from "../constants";
import Utils from "../Utils";
import ControllerRoom from "../ControllerRoom";
import PathNavigation from "../path/PathNavigation";
import eventBus from "../EventBus";
import CreepWrapper from "src/CreepWrapper";
import MemoryMap from "src/MemoryMap";

@Decorators.memory()
export abstract class Task extends BaseClass {
  protected static eventListeners: Array<{
    eventName: string,
    method: string,
  }> = [];

  protected static updateTargetEvents: Array<string> = [];

  static initClass() {
    this.eventListeners.forEach((eventListener) => {
      eventBus.subscribe(eventListener.eventName, eventListener.method, "tasksInfo." + this.className);
    });
    this.updateTargetEvents.forEach((eventListener) => {
      eventBus.subscribe(eventListener, "updateTargetsMap", "tasksInfo." + this.className);
    });
  }

  @Decorators.inMemory()
  targetsMap: any = {};

  @Decorators.inMemory()
  hasTarget: boolean = false;

  @Decorators.instanceMapInMemoryByName(CreepWrapper)
  creeps: MemoryMap<string, CreepWrapper>;

  @Decorators.inMemory()
  creepsCount: number = 0;

  // TODO: hook these up
  pathNavigation: PathNavigation;

  controllerRoom: ControllerRoom;

  abstract init(): void;

  abstract tick(): void;

  getTarget(creep) {
    let target;
    if (!creep.task.targets[creep.task.tier]) {
      target = this.assignNewTarget(creep);
    } else {
      target = Game.getObjectById(creep.task.targets[creep.task.tier]);
    }
    if (!target || !this.isTargetValid(target)) {
      this.targetIsInvalid(creep, target);
      // if target is invalid, remove it from targets of the task and get a new target
      delete this.targetsMap[creep.task.targets[creep.task.tier]];
      target = this.assignNewTarget(creep);
    }
    this.hasTarget = Object.keys(this.targetsMap).length > 0;
    return target;
  }

  assignNewTarget(creep) {
    // get the closest target
    let target: any = Utils.getClosestObject(creep, Object.keys(this.targetsMap), (target) => {
      // filter out targets that are assgined to other creeps and are not valid for more
      // eg : creepA is picking up 50 energy from a container with 50 energy.
      //   creepB cannot pickup from the same container as there wont be energy left after creepA is done picking up
      return this.isAssignedTargetValid(target);
    });
    if (target) {
      creep.task.targets[creep.task.tier] = target.id;
      this.targetIsClaimed(creep, target);
    }
    return target;
  }

  updateTargetsMap(newTargets) {
    if (!newTargets || newTargets === 1) {
      // force updating targets
      this.targetsMap = this.getTargetsMap();
    } else {
      // add new targets from event
      newTargets.forEach((target) => {
        if (this.targetsFilter(target)) {
          this.targetsMap[target.id] = 0;
        }
      });
    }
    this.hasTarget = Object.keys(this.targetsMap).length > 0;
  }

  getTargetsMap() {
    let targetsMap = {};
    this.getTargets().forEach((target) => {
      targetsMap[target] = 0;
    });
    return targetsMap;
  }

  abstract getTargets();

  abstract targetsFilter(target): boolean;

  execute(creep) {
    creep.processed = true;
    let target = this.getTarget(creep);
    // console.log(creep.name, target);
    // if there was no target found for this task
    if (!target) {
      return ERR_INVALID_TARGET;
    }
    // if the current task became invalid, return ERR_INVALID_TASK
    if (!this.isTaskValid(creep, target)) {
      return ERR_INVALID_TASK;
    }
    // if the creep has already reached target or it will in this tick, do the task
    if (this.pathNavigation.moveCreep(creep,
      this.getTargetForMovement(creep, target)) === CREEP_REACHED_TARGET) {
      let returnValue = this.doTask(creep, target);
      if (returnValue === OK) {
        this.taskExecuted(creep, target);
      }
      return returnValue;
    }
    return OK;
  }

  abstract doTask(creep, target);

  abstract taskExecuted(creep, target);

  taskStarted(creep) {
    if (creep.task && creep.task.targets && creep.task.targets[creep.task.tier]) {
      let target = Game.getObjectById(creep.task.targets[creep.task.tier]);
      if (target) {
        if (this.isAssignedTargetValid(target)) {
          this.targetIsClaimed(creep, target);
        } else {
          creep.task.targets[creep.task.tier] = null;
        }
      }
    }
  }

  taskEnded(creep) {
    if (creep.task && creep.task.targets && creep.task.targets[creep.task.tier]) {
      let target: any = Game.getObjectById(creep.task.targets[creep.task.tier]);
      if (target.direction) {
        this.pathNavigation.moveCreepTowards(creep, target, false);
      }
      if (target) {
        this.targetIsReleased(creep, target);
      }
    }
  }

  isTaskValid(creep, target): boolean {
    return this.isTargetValid(target);
  }

  abstract isTargetValid(target): boolean;

  abstract targetIsClaimed(creep, target): void;

  abstract targetIsReleased(creep, target): void;

  abstract targetIsInvalid(creep, target): void;

  abstract isAssignedTargetValid(target): boolean;

  getTargetForMovement(creep, target) {
    return target;
  }

  creepHasDied(creep) {
    this.taskEnded(creep);
  }
}
