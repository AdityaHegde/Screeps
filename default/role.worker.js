let constants = require("constants");
let utils = require("utils");
let BaseRole = require("role.base");

/**
* Worker role with dynamic allocation. Used untill the containers are setup.
* @module role
* @class WorkerRole
* @extends BaseRole
*/

let WorkerRole = BaseRole.extend({
    tick : function() {
        this.upgradeParts();

        this.spawnCreeps();

        this.tasks.forEach((taskTier, i) => {
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

        this.executeCreepsTasks();
    },

    getMaxCount : function() {
        return this.room.sourceManager.totalAvailableSpaces * 3 / 2;
    },

    isTaskFree : function(task, tier, offset) {
        offset = offset || 0;
        //console.log(task.hasTarget, task.creepsCount, Math.round(this.creepsCount, this.validTasksCount[tier]));
        return task.hasTarget && task.creepsCount < Math.round(this.creepsCount / this.validTasksCount[tier]) - offset;
    },

    assignTask : function(creep, task, taskIdx) {
        creep.task = creep.task || {
            tier : 0,
            tasks : {},
        };
        creep.task.current = taskIdx;
        creep.task.tasks[creep.task.tier] = taskIdx;
        task.creeps[creep.name] = 1;
        task.creepsCount++;
        assigned = true;

        let taskName = this.tasks[creep.task.tier][taskIdx];
        //clear the task as free if it is not free anymore
        if (this.freeTasks[creep.task.tier][taskName] && !this.isTaskFree(task, this, creep.task.tier)) {
            delete this.freeTasks[creep.task.tier][taskName];
            this.hasFreeTasks[creep.task.tier] = Object.keys(this.freeTasks[creep.task.tier]).length > 0;
        }

        //console.log("Assigning", creep.name, "to", taskName);
    },

    assignNewTask : function(creep, isNew) {
        let tier = (isNew ? 0 : creep.task.tier);
        let tasks = this.tasks[tier];
        let lastCurrent = isNew || creep.task.current == undefined ? 0 : ((creep.task.current + 1) % tasks.length);
        let i = lastCurrent;
        let assigned = false, backup = null;

        if (this.validTasksCount[tier] > 0) {
            do {
                let task = this.room.tasksInfo[tasks[i]];
                //console.log(creep.name, tasks[i]);
                if (this.isTaskFree(task, tier)) {
                    this.assignTask(creep, task, i);
                    assigned = true;
                    break;
                }
                if (backup == null && task.hasTarget) {
                    backup = i;
                }
                i = (i + 1) % tasks.length;
            } while(i != lastCurrent);
        }

        if (!assigned && backup != null) {
            this.assignTask(creep, this.room.tasksInfo[tasks[i]], backup);
        }
    },

    switchTask : function(creep) {
        creep.task.tier = (creep.task.tier + 1) % this.tasks.length;
        creep.task.current = creep.task.tasks[creep.task.tier];
        //console.log("Switching to tier", creep.task.tier, "for", creep.name);
        if (creep.task.current == undefined) {
            this.assignNewTask(creep);
        }
        //if there are free tasks and current task is not one of them and reassiging away from crrent task doesnt make it a free task
        else if (this.hasFreeTasks[creep.task.tier] &&
            !this.freeTasks[creep.task.tier][this.tasks[creep.task.tier][creep.task.current]] &&
            !this.isTaskFree(this.room.tasksInfo[this.tasks[creep.task.tier][creep.task.current]], creep.task.tier, 1)) {
                this.reassignTask(creep);
            }
        },

        reassignTask : function(creep) {
            this.clearTask(creep);
            this.assignNewTask(creep);
        },
    }, {
        PARTS : [WORK, CARRY, MOVE, MOVE],
        MAIN_PARTS : [WORK, CARRY],
        TASKS : [
            ["harvest"],
            ["dropoff", "build", "upgrade", "repair"],
        ],
        ROLE_NAME : "worker",
    });

    utils.definePropertyInMemory(WorkerRole.prototype, "validTasksCount", function() {
        return {};
    });

    utils.definePropertyInMemory(WorkerRole.prototype, "hasFreeTasks", function() {
        return {};
    });

    utils.definePropertyInMemory(WorkerRole.prototype, "freeTasks", function() {
        return {};
    });

    module.exports = WorkerRole;
