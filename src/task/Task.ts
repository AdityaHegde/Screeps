import BaseClass from "../BaseClass";
import Decorators from "../Decorators";
import { ERR_INVALID_TASK, CREEP_REACHED_TARGET } from "../constants";
import Utils from "../Utils";
import ControllerRoom from "../ControllerRoom";
import PathNavigation from "../path/PathNavigation";
import eventBus from "../EventBus";
import CreepWrapper from "src/CreepWrapper";
import MemoryMap from "src/MemoryMap";

@Decorators.memory("tasks")
export abstract class Task extends BaseClass {
  protected static eventListeners: Array<{
    eventName: string,
    method: string,
  }> = [];

  protected static updateTargetEvents: Array<string> = [];

  static taskName: string = "base";

  static initClass() {
    this.eventListeners.forEach((eventListener) => {
      eventBus.subscribe(eventListener.eventName, eventListener.method, "tasks." + this.taskName);
    });
    this.updateTargetEvents.forEach((eventListener) => {
      eventBus.subscribe(eventListener, "updateTargetsMap", "tasks." + this.taskName);
    });
  }

  @Decorators.inMemory(() => {return {}})
  targetsMap: any;

  @Decorators.inMemory(() => false)
  hasTarget: boolean;

  @Decorators.instanceMapInMemoryByName(CreepWrapper)
  creeps: MemoryMap<string, CreepWrapper>;

  @Decorators.inMemory(() => 0)
  creepsCount: number;

  // TODO: hook these up
  pathNavigation: PathNavigation;

  @Decorators.instanceInMemoryByName(ControllerRoom)
  controllerRoom: ControllerRoom;

  init(): void {
    this.updateTargetsMap();
    this.hasTarget = Object.keys(this.targetsMap).length > 0;
  };

  abstract tick(): void;

  setControllerRoom(controllerRoom: ControllerRoom) {
    this.controllerRoom = controllerRoom;
    return this;
  }

  getTarget(creep: CreepWrapper) {
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

  assignNewTarget(creep: CreepWrapper) {
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

  updateTargetsMap(newTargets = null) {
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

  execute(creep: CreepWrapper) {
    creep.processed = true;
    let target = this.getTarget(creep);

    this.logger.log(`Creep: ${creep.name} has target: ${target && target.id}`);
  
    // if there was no target found for this task
    if (!target) {
      return ERR_INVALID_TARGET;
    }
    // if the current task became invalid, return ERR_INVALID_TASK
    if (!this.isTaskValid(creep, target)) {
      return ERR_INVALID_TASK;
    }
    // if the creep has already reached target or it will in this tick, do the task
    // if (this.pathNavigation.moveCreep(creep,
    //   this.getTargetForMovement(creep, target)) === CREEP_REACHED_TARGET) {
    if (this.isNearTarget(creep, target)) {
      this.logger.log(`Creep ${creep.name} is at target: ${target && target.id}`);
      let returnValue = this.doTask(creep, target);
      if (returnValue === OK) {
        this.taskExecuted(creep, target);
      }
      return returnValue;
    } else {
      this.logger.log(`Creep ${creep.name} is moving to target: ${target && target.id}`);
      creep.moveTo(target, {
        reusePath: 0,
        // serializeMemory: true,
        visualizePathStyle: {
          fill: 'transparent',
          stroke: '#fff',
          lineStyle: 'dashed',
          strokeWidth: .15,
          opacity: .1,
        },
      });
    }
    return OK;
  }

  abstract doTask(creep: CreepWrapper, target);

  abstract taskExecuted(creep: CreepWrapper, target);

  taskStarted(creep: CreepWrapper) {
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

  taskEnded(creep: CreepWrapper) {
    if (creep.task && creep.task.targets && creep.task.targets[creep.task.tier]) {
      let target: any = Game.getObjectById(creep.task.targets[creep.task.tier]);
      // if (target.direction) {
      //   this.pathNavigation.moveCreepTowards(creep, target, false);
      // }
      if (target) {
        this.targetIsReleased(creep, target);
      }
    }
  }

  isTaskValid(creep: CreepWrapper, target): boolean {
    return this.isTargetValid(target);
  }

  isNearTarget(creep: CreepWrapper, target): boolean {
    this.logger.log(`isNearTarget? ${creep.pos.x},${creep.pos.y} : ${target.pos.x},${target.pos.y}`);
    return creep.pos.isNearTo(target);
  }

  abstract isTargetValid(target): boolean;

  abstract targetIsClaimed(creep: CreepWrapper, target): void;

  abstract targetIsReleased(creep: CreepWrapper, target): void;

  abstract targetIsInvalid(creep: CreepWrapper, target): void;

  abstract isAssignedTargetValid(target): boolean;

  getTargetForMovement(creep: CreepWrapper, target) {
    return target;
  }

  creepHasDied(creep: CreepWrapper) {
    this.taskEnded(creep);
  }
}
