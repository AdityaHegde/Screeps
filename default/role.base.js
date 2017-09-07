/* globals _, Game, Memory, WORK, CARRY, MOVE, BODYPART_COST, ERR_INVALID_TARGET, ERR_NO_BODYPART, ERR_RCL_NOT_ENOUGH, ERR_NOT_ENOUGH_RESOURCES, OK, ERR_BUSY */

let constants = require("constants");
let utils = require("utils");
let BaseClass = require("base.class");
let eventBus = require("event.bus");

/**
* Base role with static workers.
* @module role
* @class BaseRole
* @extends BaseClass
*/

let BaseRole = BaseClass("role", "roles");

BaseRole.PARTS = [WORK, CARRY, MOVE, MOVE];
BaseRole.MAIN_PARTS = [WORK, CARRY];
BaseRole.ADD_MOVE = true;
BaseRole.MAX_PARTS = 50;
BaseRole.TASKS = [];
BaseRole.EVENT_LISTENERS = [];
BaseRole.ROLE_NAME = "base";

BaseRole.init = function () {
    this.EVENT_LISTENERS.forEach((eventListener) => {
        eventBus.subscribe(eventListener.eventName, eventListener.method, "rolesInfo." + this.ROLE_NAME);
    });
};

BaseRole.__staticMembers = {
    "PARTS": 1,
    "MAIN_PARTS": 1,
    "ADD_MOVE": 1,
    "MAX_PARTS": 1,
    "TASKS": 1,
    "EVENT_LISTENERS": 1,
    "ROLE_NAME": 1,
    "init": 1
};

utils.definePropertyInMemory(BaseRole, "isActive", function () {
    return false;
});

utils.definePropertyInMemory(BaseRole, "tasks", function () {
    return _.cloneDeep(this.constructor.TASKS);
});

utils.definePropertyInMemory(BaseRole, "parts", function () {
    return this.constructor.PARTS.slice();
});

utils.definePropertyInMemory(BaseRole, "partsCost", function () {
    return this.constructor.PARTS.reduce(function (partsCost, part) {
        return partsCost + BODYPART_COST[part];
    }, 0);
});

utils.definePropertyInMemory(BaseRole, "i", function () {
    return 0;
});

utils.definePropertyInMemory(BaseRole, "creeps", function () {
    return {};
});

utils.definePropertyInMemory(BaseRole, "creepsCount", function () {
    return 0;
});

// utils.defineInstancePropertyByNameInMemory(BaseRole, "room", "rooms");

BaseRole.prototype.init = function (room) {
    this.room = room;
};

BaseRole.prototype.tick = function () {
    this.upgradeParts();

    this.spawnCreeps();

    this.executeCreepsTasks();
};

BaseRole.prototype.upgradeParts = function () {
    let newPart = this.constructor.MAIN_PARTS[this.i];

    // if the available energy capacity can accommodate the new part or if the parts has reached max parts count (50)
    while (this.room.energyCapacityAvailable >= this.partsCost + BODYPART_COST[newPart] + (this.constructor.ADD_MOVE ? BODYPART_COST[MOVE] : 0) &&
           this.parts.length <= this.constructor.MAX_PARTS - 2) {
        // have the new part at the beginig and move at the end,
        // so that when the creep is damaged movement is the last thing to be damaged
        this.parts.unshift(newPart);
        if (this.constructor.ADD_MOVE) {
            this.parts.push(MOVE);
        }
        this.partsCost += BODYPART_COST[newPart] + (this.constructor.ADD_MOVE ? BODYPART_COST[MOVE] : 0);
        this.i = (this.i + 1) % this.constructor.MAIN_PARTS.length;

        // console.log("Upgraded the creeps parts to", this.parts.join(","));

        newPart = this.constructor.MAIN_PARTS[this.i];
    }
};

BaseRole.prototype.spawnCreeps = function () {
    // spawn creeps
    if (this.creepsCount < this.getMaxCount() && this.partsCost <= this.room.energyAvailable) {
        let parts = this.parts.slice();
        let spawn = _.find(Game.spawns, (spawn) => {
            return !spawn.spawning;
        });

        if (spawn) {
            let creepName = spawn.createCreep(parts, undefined, {role: { name: this.constructor.ROLE_NAME }});
            if (_.isString(creepName)) {
                this.creeps[creepName] = 1;
                this.creepsCount++;
                this.room.delayedEvents[constants.CREEP_CREATED] = 1;
            }
        }
    }
};

BaseRole.prototype.executeCreepsTasks = function () {
    // execute creeps' tasks
    for (let creepName in this.creeps) {
        let creep = Game.creeps[creepName];

        if (creep) {
            if (!creep.spawning) {
                this.executeTask(creep);
            }
        } else if (Memory.creeps[creepName]) {
            // console.log("Creep", creepName, "died");
            Memory.creeps[creepName].name = creepName;
            this.room.creepHasDied(Memory.creeps[creepName]);
            delete Memory.creeps[creepName];
        }
    }
};

BaseRole.prototype.addCreep = function (creep) {
    if (creep.task) {
        creep.task.tasks = {};
        creep.task.tier = 0;
        creep.task.targets = {};
        delete creep.task.current;
        delete creep.task.targetType;
    }
    creep.role = {
        name: this.constructor.ROLE_NAME
    };

    this.creeps[creep.name] = 1;
    this.creepsCount++;
};

BaseRole.prototype.removeCreep = function (creep) {
    if (creep.task) {
        for (let tier in creep.task.tasks) {
            creep.task.tier = tier;
            this.clearTask(creep);
        }
    }
};

BaseRole.prototype.executeTask = function (creep) {
    // console.log(creep.name, creep.role.name, creep.task);
    if (creep.task) {
        creep.task.targets = creep.task.targets || {};
        let currentTask = this.constructor.TASKS[creep.task.tier][creep.task.current];
        // console.log(creep.name, creep.role.name, currentTask);
        if (currentTask) {
            let returnValue = this.room.tasksInfo[currentTask].execute(creep);
            switch (returnValue) {
            case ERR_INVALID_TARGET:
            case ERR_NO_BODYPART:
            case ERR_RCL_NOT_ENOUGH:
                // console.log("reassignTask");
                this.reassignTask(creep);
                break;

            case ERR_NOT_ENOUGH_RESOURCES:
            case constants.ERR_INVALID_TASK:
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
};

BaseRole.prototype.getMaxCount = function () {
    return this.room.sourceManager.totalAvailableSpaces * 3 / 2;
};

BaseRole.prototype.getMaxParts = function () {
    return this.constructor.MAX_PARTS;
};

BaseRole.prototype.isTaskFree = function (task, tier, offset) {
    return task.hasTarget;
};

BaseRole.prototype.assignTask = function (creep, task, taskIdx) {
    creep.task = creep.task || {
        tier: 0,
        tasks: {},
        targets: {}
    };
    creep.task.current = taskIdx;
    creep.task.tasks[creep.task.tier] = taskIdx;

    task.taskStarted(creep);
    task.execute(creep);
};

BaseRole.prototype.assignNewTask = function (creep, isNew) {
    let tier = (isNew ? 0 : creep.task.tier);
    let tasks = this.constructor.TASKS[tier];
    let minCreepCount = 99999, minTaskIdx, minTask;

    for (let i = 0; i < tasks.length; i++) {
        let task = this.room.tasksInfo[tasks[i]];
        if (minCreepCount > task.creepsCount) {
            minCreepCount = task.creepsCount;
            minTaskIdx = i;
            minTask = task;
        }
    }

    if (minTaskIdx >= 0) {
        this.assignTask(creep, minTask, minTaskIdx);
    }
};

BaseRole.prototype.clearTask = function (creep) {
    if (creep.task) {
        let task = this.room.tasksInfo[this.constructor.TASKS[creep.task.tier][creep.task.current]];
        if (task && task.creeps[creep.name]) {
            // console.log("Clearing", creep.name, "from", this.constructor.TASKS[creep.task.tier][creep.task.current]);
            task.taskEnded(creep);
            task.creepsCount--;
            delete task.creeps[creep.name];
            delete creep.task.targets[creep.task.tier];
        } else {
            // console.log("Trying to clear", creep.name, "of unassigned task");
        }
    }
};

BaseRole.prototype.switchTask = function (creep) {
    if (this.tasks[creep.task.tier] && this.tasks[creep.task.tier][creep.task.current]) {
        this.room.tasksInfo[this.tasks[creep.task.tier][creep.task.current]].taskEnded(creep);
    }
    creep.task.tier = (creep.task.tier + 1) % this.constructor.TASKS.length;
    creep.task.current = creep.task.tasks[creep.task.tier];
    // console.log("Switching to tier", creep.task.tier, "for", creep.name);
    if (creep.task.current === undefined) {
        this.assignNewTask(this.room, creep);
    } else {
        this.room.tasksInfo[this.tasks[creep.task.tier][creep.task.current]].taskStarted(creep);
    }
};

BaseRole.prototype.reassignTask = function (creep) {
    // TODO
};

BaseRole.prototype.creepHasDied = function (creep) {
    this.clearTask(this.room, creep);
    if (this.creeps[creep.name]) {
        delete this.creeps[creep.name];
        this.creepsCount--;
    }
};

module.exports = BaseRole;
