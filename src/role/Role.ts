import BaseClass from "../BaseClass";
import Decorators from "../Decorators";
import ControllerRoom from "../ControllerRoom";
import { CREEP_CREATED, ERR_INVALID_TASK } from "../constants";
import _ from "lodash";
import eventBus from "../EventBus";
import CreepWrapper from "src/CreepWrapper";
import { Task } from "src/task/Task";

@Decorators.memory("roles")
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
  static roleName: string = "base";

  @Decorators.inMemory(() => false)
  isActive: boolean;

  @Decorators.inMemory(function () {
    return _.cloneDeep(this.creepTasks)
  })
  tasks: Array<Array<string>>;

  @Decorators.inMemory(function () {
    if (this.parts) {
      return this.parts.reduce(function (partsCost, part) {
        return partsCost + BODYPART_COST[part];
      }, 0);
    }
    return 0;
  })
  partsCost: number;

  @Decorators.inMemory(() => 0)
  i: number;

  @Decorators.inMemory(() => {return {}})
  creeps: any;

  @Decorators.inMemory(() => 0)
  creepsCount: number;

  @Decorators.inMemory(function () {
    return _.cloneDeep(this.constructor["creepParts"])
  })
  parts: Array<string>;

  @Decorators.instanceInMemoryByName(ControllerRoom)
  protected controllerRoom: ControllerRoom;
  
  freeTasks: any = {};
  hasFreeTasks: any = {};
  validTasksCount: any = {};

  static initClass() {
    this.eventListeners.forEach((eventListener) => {
      eventBus.subscribe(eventListener.eventName, eventListener.method, "roleManager.roles." + this.roleName);
    });
  }

  setControllerRoom(controllerRoom: ControllerRoom) {
    this.controllerRoom = controllerRoom;
    return this;
  }

  abstract init();

  tick() {
    this.upgradeParts();
  
    this.spawnCreeps();
  
    this.executeCreepsTasks();
  }

  upgradeParts() {
    let newPart = this.constructor["mainParts"][this.i];

    // this.logger.log("[Upgrade Parts]", `Capacity: ${this.controllerRoom.room.energyCapacityAvailable}. ` +
    //   `Parts Cost: ${this.partsCost}. New Cost: ${this.partsCost + BODYPART_COST[newPart] +
    //     (this.constructor["addMove"] ? BODYPART_COST[MOVE] : 0)}`);

    let upgraded = false;

    // if the available energy capacity can accommodate the new part or if the parts has reached max parts count (50)
    while (this.controllerRoom.room.energyCapacityAvailable >= this.partsCost + BODYPART_COST[newPart] +
        (this.constructor["addMove"] ? BODYPART_COST[MOVE] : 0) &&
         this.parts.length <= this.constructor["maxParts"] - 2) {
      upgraded = true;

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

    this.logger.log(`Upgrade Parts? upgrade=${upgraded}`);
  }

  spawnCreeps() {
    // spawn creeps
    if (this.creepsCount < this.getMaxCount() && this.partsCost <= this.controllerRoom.room.energyAvailable) {
      let parts = this.parts.slice();
      let spawn = _.find(Game.spawns, (spawn) => {
        return !spawn.spawning;
      });

      if (spawn) {
        this.logger.log("Spawning creeps");
        Memory["creepsName"] = Memory["creepsName"] || 0;
        let creepName = "Worker" + Memory["creepsName"];
        let retName = spawn.spawnCreep(parts as any, creepName, {
          // TODO: select this based on spawn
          directions: [TOP, RIGHT, BOTTOM],
          memory: {role: { name: this.constructor["className"] }},
        });
        if (retName === OK) {
          this.creeps[creepName] = 1;
          this.creepsCount++;
          Memory["creepsName"]++;
          eventBus.fireDelayedEvent(CREEP_CREATED, this.controllerRoom);
          this.logger.log(`Creep ${creepName} Created`);
        }
      }
    } else {
      this.logger.log("Not spawning creeps");
    }
  }

  executeCreepsTasks() {
    // execute creeps' tasks
    for (let creepName in this.creeps) {
      let creep = CreepWrapper.getCreepByName(creepName);
  
      if (creep) {
        if (!creep.spawning) {
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
    // this.logger.log(creep.name, creep.role.name, creep.task);
    if (creep.task) {
      creep.task.targets = creep.task.targets || {};
      let currentTask = this.constructor["creepTasks"][creep.task.tier][creep.task.current];
      this.logger.log(`creepName=${creep.name} role=${creep.role.name} task=${currentTask}`);
      if (currentTask) {
        let returnValue = this.controllerRoom.tasks.get(currentTask).execute(creep);
        switch (returnValue) {
        case ERR_INVALID_TARGET:
        case ERR_NO_BODYPART:
        case ERR_RCL_NOT_ENOUGH:
          // this.logger.log("reassignTask");
          this.reassignTask(creep);
          break;

        case ERR_NOT_ENOUGH_RESOURCES:
        case ERR_INVALID_TASK:
          // this.logger.log("switchTask");
          this.switchTask(creep);
          break;

        case OK:
        case ERR_BUSY:
          // this.logger.log("OK");
          break;

        default:
          // this.logger.log(returnValue);
          break;
        }
      } else {
        this.assignNewTask(creep);
      }
    } else {
      this.assignNewTask(creep, true);
    }
  }

  abstract getMaxCount();

  getMaxParts() {
    return this.constructor["maxParts"];
  }

  isTaskFree(task, tier, offset) {
    return task.hasTarget;
  }

  assignTask(creep: CreepWrapper, task: Task, taskIdx) {
    creep.task = creep.task || {
      tier: 0,
      tasks: {},
      targets: {}
    };
    creep.task.current = taskIdx;
    creep.task.tasks[creep.task.tier] = taskIdx;

    if (!task.creeps.has(creep.name)) {
      task.creeps.set(creep.name, creep);

    }

    task.taskStarted(creep);
    task.execute(creep);
  }

  assignNewTask(creep: CreepWrapper, isNew = false) {
    let tier = (isNew ? 0 : creep.task.tier);
    let tasks = this.constructor["creepTasks"][tier];
    let minCreepCount = 99999, minTaskIdx, minTask: Task;

    for (let i = 0; i < tasks.length; i++) {
      let task = this.controllerRoom.tasks.get(tasks[i]);
      if (minCreepCount > task.creeps.size) {
        minCreepCount = task.creeps.size;
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
