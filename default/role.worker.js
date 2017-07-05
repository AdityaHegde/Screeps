let constants = require("constants");
let MAX_PARTS = 50;
let baseRole = require("role.base");

/**
 * Worker role with dynamic allocation. Used untill the containers are setup.
 * @module role
 * @Class WorkerRole
 * @extends BaseRole
 */

module.exports = _.assign({}, baseRole, {
    PARTS : [WORK, CARRY, MOVE, MOVE],
    MAIN_PARTS : [WORK, CARRY],
    TASKS : [
        ["harvest"],
        ["dropoff", "build", "upgrade", "repair"],
    ],
    ROLE_NAME : "worker",

    init : function(room, roleInfo) {
        console.log(JSON.stringify(this.TASKS));
        return {
            tasks : _.cloneDeep(this.TASKS),
            parts : this.PARTS.slice(),
            partsCost : this.PARTS.reduce(function(partsCost, part) {
                return partsCost + BODYPART_COST[part];
            }, 0),
            i : 0,
            validTasksCount : {},
            hasFreeTasks : {},
            freeTasks : {},
            creeps : {},
            creepsCount : 0,
        };
    },

    getMaxCount : function(room, roleInfo) {
        return room.sourceManager.totalAvailableSpaces * 3 / 2;
    },

    isTaskFree : function(taskInfo, roleInfo, tier, offset) {
        offset = offset || 0;
        //console.log(taskInfo.hasTarget, taskInfo.creepsCount, Math.round(roleInfo.creepsCount, roleInfo.validTasksCount[tier]));
        return taskInfo.hasTarget && taskInfo.creepsCount < Math.round(roleInfo.creepsCount / roleInfo.validTasksCount[tier]) - offset;
    },

    assignTask : function(creep, roleInfo, taskInfo, taskIdx) {
        creep.task = creep.task || {
            tier : 0,
            tasks : {},
        };
        creep.task.current = taskIdx;
        creep.task.tasks[creep.task.tier] = taskIdx;
        taskInfo.creeps[creep.name] = 1;
        taskInfo.creepsCount++;
        assigned = true;

        var taskName = roleInfo.tasks[creep.task.tier][taskIdx];
        //clear the task as free if it is not free anymore
        if (roleInfo.freeTasks[creep.task.tier][taskName] && !this.isTaskFree(taskInfo, roleInfo, creep.task.tier)) {
            delete roleInfo.freeTasks[creep.task.tier][taskName];
            roleInfo.hasFreeTasks[creep.task.tier] = Object.keys(roleInfo.freeTasks[creep.task.tier]).length > 0;
        }

        //console.log("Assigning", creep.name, "to", taskName);
    },

    assignNewTask : function(room, creep, isNew) {
        let roleInfo = room.rolesInfo[creep.role.name];
        let tier = (isNew ? 0 : creep.task.tier);
        let tasks = roleInfo.tasks[tier];
        let lastCurrent = isNew || creep.task.current == undefined ? 0 : ((creep.task.current + 1) % tasks.length);
        let i = lastCurrent;
        let assigned = false, backup = null;

        if (roleInfo.validTasksCount[tier] > 0) {
            do {
                let taskInfo = room.tasksInfo[tasks[i]];
                //console.log(creep.name, tasks[i]);
                if (this.isTaskFree(taskInfo, roleInfo, tier)) {
                    this.assignTask(creep, roleInfo, taskInfo, i);
                    assigned = true;
                    break;
                }
                if (backup == null && taskInfo.hasTarget) {
                    backup = i;
                }
                i = (i + 1) % tasks.length;
            } while(i != lastCurrent);
        }

        if (!assigned && backup != null) {
            this.assignTask(creep, roleInfo, room.tasksInfo[tasks[i]], backup);
        }
    },

    switchTask : function(room, creep) {
        var roleInfo = room.rolesInfo[creep.role.name];
        creep.task.tier = (creep.task.tier + 1) % roleInfo.tasks.length;
        creep.task.current = creep.task.tasks[creep.task.tier];
        //console.log("Switching to tier", creep.task.tier, "for", creep.name);
        if (creep.task.current == undefined) {
            this.assignNewTask(room, creep);
        }
        //if there are free tasks and current task is not one of them and reassiging away from crrent task doesnt make it a free task
        else if (roleInfo.hasFreeTasks[creep.task.tier] &&
                 !roleInfo.freeTasks[creep.task.tier][roleInfo.tasks[creep.task.tier][creep.task.current]] &&
                 !this.isTaskFree(room.tasksInfo[roleInfo.tasks[creep.task.tier][creep.task.current]], roleInfo, creep.task.tier, 1)) {
            this.reassignTask(room, creep);
        }
    },

    reassignTask : function(room, creep) {
        this.clearTask(room, creep);
        this.assignNewTask(room, creep);
    },
});
