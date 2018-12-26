import BaseClass from "../BaseClass";
import Decorators from "../Decorators";
import ControllerRoom from "../ControllerRoom";
import { CREEP_CREATED, ERR_INVALID_TASK } from "../constants";
import * as _ from "lodash";
import eventBus from "../EventBus";
import CreepWrapper from "src/CreepWrapper";

@Decorators.memory()
export default abstract class Role extends BaseClass {
  static creepParts: Array<BodyPartConstant> = [WORK, CARRY, MOVE, MOVE];
  static mainParts: Array<BodyPartConstant> = [WORK, CARRY];
  static addMove: boolean = true;
  static maxParts = MAX_CREEP_SIZE;
  static creepTasks: Array<Array<string>> = [];
  static eventListeners: Array<{
    eventName: string;
    method: string;
  }> = [];

  @Decorators.inMemory()
  isActive: boolean = false;

  @Decorators.inMemory(() => {
    return _.cloneDeep(this.creepTasks)
  })
  tasks: Array<Array<string>>;

  @Decorators.inMemory(() => {
    return this.parts.reduce(function (partsCost, part) {
      return partsCost + BODYPART_COST[part];
    }, 0);
  })
  partsCost: number;

  @Decorators.inMemory()
  i: number = 0;

  @Decorators.inMemory()
  creeps: any = {};

  @Decorators.inMemory()
  creepsCount: number = 0;

  @Decorators.inMemory(() => {
    return _.cloneDeep(this.creepParts)
  })
  parts: Array<string>;
  
  // TODO: hook these up
  protected controllerRoom: ControllerRoom;
  
  freeTasks: any = {};
  hasFreeTasks: any = {};
  validTasksCount: any = {};

  abstract init();

  tick() {
    this.upgradeParts();
  
    this.spawnCreeps();
  
    this.executeCreepsTasks();
  }

  upgradeParts() {
    let newPart = this.constructor["mainParts"][this.i];

    // if the available energy capacity can accommodate the new part or if the parts has reached max parts count (50)
    while (this.controllerRoom.room.energyCapacityAvailable >= this.partsCost + BODYPART_COST[newPart] +
        (this.constructor["addMove"] ? BODYPART_COST[MOVE] : 0) &&
         this.parts.length <= this.constructor["maxParts"] - 2) {
      // have the new part at the beginig and move at the end,
      // so that when the creep is damaged movement is the last thing to be damaged
      this.parts.unshift(newPart);
      if (this.constructor["addMove"]) {
        this.parts.push(MOVE);
      }
      this.partsCost += BODYPART_COST[newPart] + (this.constructor["addMove"] ? BODYPART_COST[MOVE] : 0);
      this.i = (this.i + 1) % this.constructor["mainParts"].length;
  
      // console.log("Upgraded the creeps parts to", this.parts.join(","));
  
      newPart = this.constructor["mainParts"][this.i];
    }
  }

  spawnCreeps() {
    // spawn creeps
    if (this.creepsCount < this.getMaxCount() && this.partsCost <= this.controllerRoom.room.energyAvailable) {
      let parts = this.parts.slice();
      let spawn = _.find(Game.spawns, (spawn) => {
        return !spawn.spawning;
      });

      if (spawn) {
        let creepName = spawn.createCreep(parts as any, undefined, {role: { name: this.constructor["className"] }});
        if (_.isString(creepName)) {
          this.creeps[creepName] = 1;
          this.creepsCount++;
          eventBus.fireDelayedEvent(CREEP_CREATED, this.controllerRoom);
        }
      }
    }
  }
  
  executeCreepsTasks() {
    // execute creeps' tasks
    for (let creepName in this.creeps) {
      let creep = CreepWrapper.getCreepByName(creepName);
  
      if (creep) {
        if (!creep.creep.spawning) {
          this.executeTask(creep);
        }
      } else if (Memory.creeps[creepName]) {
        // console.log("Creep", creepName, "died");
        (Memory.creeps[creepName] as any).name = creepName;
        // this.controllerRoom.creepHasDied(Memory.creeps[creepName]);
        delete Memory.creeps[creepName];
      }
    }
  }

  addCreep(creep: CreepWrapper) {
    if (creep.task) {
      creep.task.tasks = {};
      creep.task.tier = 0;
      creep.task.targets = {};
      delete creep.task.current;
      delete creep.task.targetType;
    }
    creep.role = {
      name: this.constructor["className"]
    };
  
    this.creeps[creep.name] = 1;
    this.creepsCount++;
  }

  removeCreep(creep: CreepWrapper) {
    if (creep.task) {
      for (let tier in creep.task.tasks) {
        creep.task.tier = tier;
        this.clearTask(creep);
      }
    }
  }

  executeTask(creep: CreepWrapper) {
    // console.log(creep.name, creep.role.name, creep.task);
    if (creep.task) {
      creep.task.targets = creep.task.targets || {};
      let currentTask = this.constructor["creepTasks"][creep.task.tier][creep.task.current];
      // console.log(creep.name, creep.role.name, currentTask);
      if (currentTask) {
        let returnValue = this.controllerRoom.tasks.get(currentTask).execute(creep);
        switch (returnValue) {
        case ERR_INVALID_TARGET:
        case ERR_NO_BODYPART:
        case ERR_RCL_NOT_ENOUGH:
          // console.log("reassignTask");
          this.reassignTask(creep);
          break;

        case ERR_NOT_ENOUGH_RESOURCES:
        case ERR_INVALID_TASK:
          // console.log("switchTask");
          this.switchTask(creep);
          break;

        case OK:
        case ERR_BUSY:
          // console.log("OK");
          break;

        default:
          // console.log(returnValue);
          break;
        }
      } else {
        this.assignNewTask(creep);
      }
    } else {
      this.assignNewTask(creep, true);
    }
  }

  getMaxCount() {
    return this.controllerRoom.sourceManager.totalAvailableSpaces * 3 / 2;
  }
  
  getMaxParts() {
    return this.constructor["maxParts"];
  }
  
  isTaskFree(task, tier, offset) {
    return task.hasTarget;
  }
  
  assignTask(creep: CreepWrapper, task, taskIdx) {
    creep.task = creep.task || {
      tier: 0,
      tasks: {},
      targets: {}
    };
    creep.task.current = taskIdx;
    creep.task.tasks[creep.task.tier] = taskIdx;
  
    task.taskStarted(creep);
    task.execute(creep);
  }

  assignNewTask(creep: CreepWrapper, isNew = false) {
    let tier = (isNew ? 0 : creep.task.tier);
    let tasks = this.constructor["creepTasks"][tier];
    let minCreepCount = 99999, minTaskIdx, minTask;
  
    for (let i = 0; i < tasks.length; i++) {
      let task = this.controllerRoom.tasks.get(tasks[i]);
      if (minCreepCount > task.creepsCount) {
        minCreepCount = task.creepsCount;
        minTaskIdx = i;
        minTask = task;
      }
    }
  
    if (minTaskIdx >= 0) {
      this.assignTask(creep, minTask, minTaskIdx);
    }
  }
  
  clearTask(creep: CreepWrapper) {
    if (creep.task) {
      let task = this.controllerRoom.tasks.get(this.constructor["creepTasks"][creep.task.tier][creep.task.current]);
      if (task && task.creeps.has(creep.name)) {
        // console.log("Clearing", creep.name, "from", this.constructor["creepTasks"][creep.task.tier][creep.task.current]);
        task.taskEnded(creep);
        task.creepsCount--;
        task.creeps.delete(creep.name);
        delete creep.task.targets[creep.task.tier];
      } else {
        // console.log("Trying to clear", creep.name, "of unassigned task");
      }
    }
  }

  switchTask(creep: CreepWrapper) {
    if (this.tasks[creep.task.tier] && this.tasks[creep.task.tier][creep.task.current]) {
      this.controllerRoom.tasks.get(this.tasks[creep.task.tier][creep.task.current]).taskEnded(creep);
    }
    creep.task.tier = (creep.task.tier + 1) % this.constructor["creepTasks"].length;
    creep.task.current = creep.task.tasks[creep.task.tier];
    // console.log("Switching to tier", creep.task.tier, "for", creep.name);
    if (creep.task.current === undefined) {
      this.assignNewTask(creep);
    } else {
      this.controllerRoom.tasks.get(this.tasks[creep.task.tier][creep.task.current]).taskStarted(creep);
    }
  }

  reassignTask(creep: CreepWrapper) {
    // TODO
  }
  
  creepHasDied(creep: CreepWrapper) {
    this.clearTask(creep);
    if (this.creeps[creep.name]) {
      delete this.creeps[creep.name];
      this.creepsCount--;
    }
  }
}
