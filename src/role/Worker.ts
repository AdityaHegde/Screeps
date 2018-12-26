import Role from "./Role";
import Decorators from "src/Decorators";
import CreepWrapper from "src/CreepWrapper";

/**
 * Worker role with dynamic allocation. Used untill the containers are setup.
 * @module role
 * @class Worker
 * @extends Role
 */
@Decorators.memory()
export default class Worker extends Role {
  static creepParts: Array<BodyPartConstant> = [WORK, CARRY, MOVE, MOVE];
  static mainParts: Array<BodyPartConstant> = [WORK, CARRY];
  static creepTasks: Array<Array<string>> = [
    ["harvest"],
    ["dropoff", "build", "upgrade", "repair"],
  ];

  init() {}

  tick() {
    this.upgradeParts();

    this.freeTasks = {};
    this.hasFreeTasks = {};
    this.validTasksCount = {};
    this.constructor["workerTasks"].forEach((taskTier, i) => {
      this.freeTasks[i] = {};
      this.hasFreeTasks[i] = false;
      this.validTasksCount[i] = 0;

      taskTier.forEach((taskName) => {
        let task = this.controllerRoom.tasks.get(taskName);
        this.validTasksCount[i] += task.hasTarget ? 1 : 0;
        if (this.isTaskFree(task, this, i)) {
          this.hasFreeTasks[i] = true;
          this.freeTasks[i][taskName] = 1;
        }
      });
    });

    this.spawnCreeps();

    this.executeCreepsTasks();
  }

  getMaxCount() {
    return this.controllerRoom.sourceManager.totalAvailableSpaces * 3 / 2;
  }

  isTaskFree(task, tier, offset = 0) {
    return task.hasTarget &&
      task.creepsCount < Math.round(this.creepsCount / this.validTasksCount[tier]) - offset;
  }

  assignTask(creep: CreepWrapper, task, taskIdx) {
    creep.task = creep.task || {
      tier: 0,
      tasks: {}
    };
    creep.task.current = taskIdx;
    creep.task.tasks[creep.task.tier] = taskIdx;
    task.creeps[creep.name] = 1;
    task.creepsCount++;

    let taskName = this.constructor["workerTasks"][creep.task.tier][taskIdx];
    // clear the task as free if it is not free anymore
    if (this.freeTasks[creep.task.tier][taskName] && !this.isTaskFree(task, this, creep.task.tier)) {
      delete this.freeTasks[creep.task.tier][taskName];
      this.hasFreeTasks[creep.task.tier] = Object.keys(this.freeTasks[creep.task.tier]).length > 0;
    }

    task.taskStarted(creep);
    task.execute(creep);
  }

  assignNewTask(creep: CreepWrapper, isNew = false) {
    let tier = (isNew ? 0 : creep.task.tier);
    let tasks = this.constructor["workerTasks"][tier];
    let lastCurrent = isNew || creep.task.current === undefined ? 0 : ((creep.task.current + 1) % tasks.length);
    let i = lastCurrent;
    let assigned = false, backup = null;

    if (this.validTasksCount[tier] > 0) {
      do {
        let task = this.controllerRoom.tasks.get(tasks[i]);
        if (this.isTaskFree(task, tier)) {
          this.assignTask(creep, task, i);
          assigned = true;
          break;
        }
        if (backup === null && task.hasTarget) {
          backup = i;
        }
        i = (i + 1) % tasks.length;
      } while (i !== lastCurrent);
    }

    if (!assigned && backup !== null) {
      this.assignTask(creep, this.controllerRoom.tasks.get(tasks[i]), backup);
    }
  }

  switchTask(creep: CreepWrapper) {
    if (this.constructor["workerTasks"][creep.task.tier] && this.constructor["workerTasks"][creep.task.tier][creep.task.current]) {
      this.controllerRoom.tasks.get(this.constructor["workerTasks"][creep.task.tier][creep.task.current]).taskEnded(creep);
    }
    creep.task.tier = (creep.task.tier + 1) % this.constructor["workerTasks"].length;
    creep.task.current = creep.task.tasks[creep.task.tier];
    let newTask = this.controllerRoom.tasks.get(this.constructor["workerTasks"][creep.task.tier][creep.task.current]);
    if (creep.task.current === undefined) {
      this.assignNewTask(creep);
    } else if (this.hasFreeTasks[creep.task.tier] &&
         !this.freeTasks[creep.task.tier][this.constructor["workerTasks"][creep.task.tier][creep.task.current]] &&
         !this.isTaskFree(newTask, creep.task.tier, 1)) {
      // if there are free tasks and current task is not one of them and reassiging away from crrent task doesnt make it a free task
      this.reassignTask(creep);
    } else {
      this.controllerRoom.tasks.get(newTask).taskStarted(creep);
    }
  }

  reassignTask(creep: CreepWrapper) {
    this.clearTask(creep);
    this.assignNewTask(creep);
  }
}
