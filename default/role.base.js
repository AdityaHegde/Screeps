let constants = require("constants");
let TASKS = require("task.list");
let MAX_PARTS = 50;

/**
* Base role with static workers.
* @module role
* @Class BaseRole
*/

module.exports = {
    PARTS : [WORK, CARRY, MOVE, MOVE],
    MAIN_PARTS : [WORK, CARRY],
    TASKS : [
        ["harvest"],
        ["dropoff", "build", "upgrade", "repair"],
    ],
    ROLE_NAME : "base",

    init : function(room, roleInfo) {
        return {
            tasks : _.cloneDeep(this.TASKS),
            parts : this.PARTS.slice(),
            partsCost : this.PARTS.reduce(function(partsCost, part) {
                return partsCost + BODYPART_COST[part];
            }, 0),
            i : 0,
            creeps : {},
            creepsCount : 0,
        };
    },

    tick : function(room, roleInfo) {
        this.upgradeParts(room, roleInfo);

        //spawn creeps
        //console.log(roleInfo.creepsCount, this.getMaxCount(room, roleInfo));
        if (roleInfo.creepsCount < this.getMaxCount(room, roleInfo)) {
            let parts = roleInfo.parts.slice();
            //TODO select a free spawn
            let spawn = Game.spawns[room.spawns[0]];
            if(spawn.canCreateCreep(parts, undefined) == OK) {
                let creepName = spawn.createCreep(parts, undefined, {role: { name : this.ROLE_NAME }});
                roleInfo.creeps[creepName] = 1;
                roleInfo.creepsCount++;
                room.fireEvents[constants.CREEP_CREATED] = 1;
                console.log("Creating a", this.ROLE_NAME, ":", creepName);
            }
        }

        roleInfo.tasks.forEach((taskTiers, i) => {
            if (roleInfo.validTasksCount) {
                roleInfo.freeTasks[i] = {};
                roleInfo.hasFreeTasks[i] = false;
                roleInfo.validTasksCount[i] = 0;
            }

            taskTiers.forEach((taskName) => {
                var taskInfo = room.tasksInfo[taskName];
                //console.log(taskName, ":", taskInfo.creepsCount, "/", roleInfo.creepsCount);
                if (roleInfo.validTasksCount) {
                    roleInfo.validTasksCount[i] += taskInfo.hasTarget ? 1 : 0;
                    if (this.isTaskFree(taskInfo, roleInfo, i)) {
                        roleInfo.hasFreeTasks[i] = true;
                        roleInfo.freeTasks[i][taskName] = 1;
                    }
                }
            });
        });

        //execute creeps' tasks
        for (let creepName in roleInfo.creeps) {
            var creep = Game.creeps[creepName];

            if (creep) {
                if (!creep.spawning) {
                    this.executeTask(room, creep);
                }
            }
            else if (Memory.creeps[creepName]) {
                console.log("Creep", creepName, "died");
                Memory.creeps[creepName].name = creepName;
                this.creepHasDied(room, Memory.creeps[creepName], roleInfo);
                delete Memory.creeps[creepName];
            }
        }
    },

    upgradeParts : function(room, roleInfo) {
        let newPart = this.MAIN_PARTS[roleInfo.i];

        //if the available energy capacity can accommodate the new part or if the parts has reached max parts count (50)
        while (room.energyCapacityAvailable >= roleInfo.partsCost + BODYPART_COST[newPart] + BODYPART_COST[MOVE] && roleInfo.parts.length <= MAX_PARTS - 2) {
            //have the new part at the beginig and move at the end, so that when the creep is damaged movement is the last thing to be damaged
            roleInfo.parts.unshift(newPart);
            roleInfo.parts.push(MOVE);
            roleInfo.partsCost += BODYPART_COST[newPart] + BODYPART_COST[MOVE];
            roleInfo.i = (roleInfo.i + 1) % this.MAIN_PARTS.length;

            //console.log("Upgraded the creeps parts to", roleInfo.parts.join(","));

            newPart = this.MAIN_PARTS[roleInfo.i];
        }
    },

    addCreep : function(room, creep, roleInfo) {
        creep.task = null;
        creep.role = {
            name : this.ROLE_NAME,
        };
        roleInfo.creeps[creep.name] = 1;
        roleInfo.creepsCount++;
        this.assignNewTask(room, creep, true);
    },

    executeTask : function(room, creep) {
        if (creep.task) {
            var roleInfo = room.rolesInfo[creep.role.name];
            var currentTask = roleInfo.tasks[creep.task.tier][creep.task.current];
            //console.log(creep.name, currentTask);
            if (currentTask) {
                let returnValue = TASKS[currentTask].execute(room, creep, room.tasksInfo[currentTask]);
                switch (returnValue) {
                    case ERR_INVALID_TARGET:
                    case ERR_NO_BODYPART:
                    case ERR_RCL_NOT_ENOUGH:
                        this.reassignTask(room, creep);
                        break;

                    case ERR_NOT_ENOUGH_RESOURCES:
                    case constants.ERR_INVALID_TASK:
                        this.switchTask(room, creep);
                        break;

                    case OK:
                    case ERR_BUSY:
                        break;

                    default:
                        break;
                }
            }
            else {
                this.assignNewTask(room, creep);
            }
        }
        else {
            this.assignNewTask(room, creep, true);
        }
    },

    getMaxCount : function(room, roleInfo) {
        return room.sourceManager.totalAvailableSpaces * 3 / 2;
    },

    isTaskFree : function(taskInfo, roleInfo, tier, offset) {
        return taskInfo.hasTarget;
    },

    assignTask : function(creep, roleInfo, taskInfo, taskIdx) {
        creep.task = creep.task || {
            tier : 0,
            tasks : {},
        };
        creep.task.current = taskIdx;
        creep.task.tasks[creep.task.tier] = taskIdx;

        console.log("Assigning", creep.name, "to", roleInfo.tasks[creep.task.tier][taskIdx]);
    },

    assignNewTask : function(room, creep, isNew) {
        let roleInfo = room.rolesInfo[creep.role.name];
        let tier = (isNew ? 0 : creep.task.tier);
        let tasks = roleInfo.tasks[tier];
        let minCreepCount = 99999, minTaskIdx, minTaskInfo;
        let assigned = false;

        for (let i = 0; i < tasks.length; i++) {
            let taskInfo = room.tasksInfo[tasks[i]];
            if (minCreepCount > taskInfo.creepsCount) {
                minCreepCount = taskInfo.creepsCount;
                minTaskIdx = i;
                minTaskInfo = taskInfo;
            }
        }

        if (minTaskIdx >= 0) {
            this.assignTask(creep, roleInfo, minTaskInfo, minTaskIdx);
        }
    },

    clearTask : function(room, creep) {
        if (creep.task) {
            let roleInfo = room.rolesInfo[creep.role.name];
            let taskInfo = room.tasksInfo[roleInfo.tasks[creep.task.tier][creep.task.current]];
            if (taskInfo && taskInfo.creeps[creep.name]) {
                console.log("Clearing", creep.name, "from", roleInfo.tasks[creep.task.tier][creep.task.current]);
                taskInfo.creepsCount--;
                delete taskInfo.creeps[creep.name];
            }
            else {
                console.log("Trying to clear", creep.name, "of unassigned task");
            }
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
    },

    reassignTask : function(room, creep) {
        //TODO
    },

    creepHasDied : function(room, creep, roleInfo) {
        this.clearTask(room, creep);
        if (roleInfo.creeps[creep.name]) {
            delete roleInfo.creeps[creep.name];
            roleInfo.creepsCount--;
        }
        roleInfo.tasks.forEach((taskTiers, i) => {
            taskTiers.forEach((taskName) => {
                TASKS[taskName].creepHasDied(room, creep);
            });
        });
    },
};
