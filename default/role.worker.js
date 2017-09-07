/* globals WORK, CARRY, MOVE */

let BaseRole = require("role.base");

/**
* Worker role with dynamic allocation. Used untill the containers are setup.
* @module role
* @class WorkerRole
* @extends BaseRole
*/

let WorkerRole = BaseRole.extend({
    tick: function () {
        this.upgradeParts();

        this.freeTasks = {};
        this.hasFreeTasks = {};
        this.validTasksCount = {};
        this.constructor.TASKS.forEach((taskTier, i) => {
            this.freeTasks[i] = {};
            this.hasFreeTasks[i] = false;
            this.validTasksCount[i] = 0;

            taskTier.forEach((taskName) => {
                let task = this.room.tasksInfo[taskName];
                this.validTasksCount[i] += task.hasTarget ? 1 : 0;
                if (this.isTaskFree(task, this, i)) {
                    this.hasFreeTasks[i] = true;
                    this.freeTasks[i][taskName] = 1;
                }
            });
        });

        this.spawnCreeps();

        this.executeCreepsTasks();
    },

    getMaxCount: function () {
        return this.room.sourceManager.totalAvailableSpaces * 3 / 2;
    },

    isTaskFree: function (task, tier, offset) {
        offset = offset || 0;
        return task.hasTarget && task.creepsCount < Math.round(this.creepsCount / this.validTasksCount[tier]) - offset;
    },

    assignTask: function (creep, task, taskIdx) {
        creep.task = creep.task || {
            tier: 0,
            tasks: {}
        };
        creep.task.current = taskIdx;
        creep.task.tasks[creep.task.tier] = taskIdx;
        task.creeps[creep.name] = 1;
        task.creepsCount++;

        let taskName = this.constructor.TASKS[creep.task.tier][taskIdx];
        // clear the task as free if it is not free anymore
        if (this.freeTasks[creep.task.tier][taskName] && !this.isTaskFree(task, this, creep.task.tier)) {
            delete this.freeTasks[creep.task.tier][taskName];
            this.hasFreeTasks[creep.task.tier] = Object.keys(this.freeTasks[creep.task.tier]).length > 0;
        }

        task.taskStarted(creep);
        task.execute(creep);
    },

    assignNewTask: function (creep, isNew) {
        let tier = (isNew ? 0 : creep.task.tier);
        let tasks = this.constructor.TASKS[tier];
        let lastCurrent = isNew || creep.task.current === undefined ? 0 : ((creep.task.current + 1) % tasks.length);
        let i = lastCurrent;
        let assigned = false, backup = null;

        if (this.validTasksCount[tier] > 0) {
            do {
                let task = this.room.tasksInfo[tasks[i]];
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
            this.assignTask(creep, this.room.tasksInfo[tasks[i]], backup);
        }
    },

    switchTask: function (creep) {
        if (this.tasks[creep.task.tier] && this.tasks[creep.task.tier][creep.task.current]) {
            this.room.tasksInfo[this.tasks[creep.task.tier][creep.task.current]].taskEnded(creep);
        }
        creep.task.tier = (creep.task.tier + 1) % this.constructor.TASKS.length;
        creep.task.current = creep.task.tasks[creep.task.tier];
        if (creep.task.current === undefined) {
            this.assignNewTask(creep);
        } else if (this.hasFreeTasks[creep.task.tier] &&
                 !this.freeTasks[creep.task.tier][this.constructor.TASKS[creep.task.tier][creep.task.current]] &&
                 !this.isTaskFree(this.room.tasksInfo[this.constructor.TASKS[creep.task.tier][creep.task.current]], creep.task.tier, 1)) {
            // if there are free tasks and current task is not one of them and reassiging away from crrent task doesnt make it a free task
            this.reassignTask(creep);
        } else {
            this.room.tasksInfo[this.tasks[creep.task.tier][creep.task.current]].taskStarted(creep);
        }
    },

    reassignTask: function (creep) {
        this.clearTask(creep);
        this.assignNewTask(creep);
    }
}, {
    PARTS: [WORK, CARRY, MOVE, MOVE],
    MAIN_PARTS: [WORK, CARRY],
    TASKS: [
        ["harvest"],
        ["dropoff", "build", "upgrade", "repair"]
    ],
    ROLE_NAME: "worker"
});

module.exports = WorkerRole;
