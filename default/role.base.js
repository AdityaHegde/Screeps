let constants = require("constants");
let utils = require("utils");
let BaseClass = require("base.class");

/**
* Base role with static workers.
* @module role
* @class BaseRole
* @extends BaseClass
*/

let BaseRole = BaseClass("role");

BaseRole.PARTS = [WORK, CARRY, MOVE, MOVE];
BaseRole.MAIN_PARTS = [WORK, CARRY];
BaseRole.MAX_PARTS = 50;
BaseRole.TASKS = [];
BaseRole.EVENT_LISTENERS = [];
BaseRole.ROLE_NAME = "base";

BaseRole.init = function() {
    this.EVENT_LISTENERS.forEach((eventListener) => {
        eventBus.subscribe(eventListener.eventName, this.prototype[eventListener.method], "rolesInfo." + this.ROLE_NAME);
    });
};

BaseTask.__staticMembers = ["PARTS", "MAIN_PARTS", "TASKS", "EVENT_LISTENERS", "ROLE_NAME", "init"];

utils.definePropertyInMemory(BaseRole.prototype, "isActive", function() {
    return false;
});

utils.definePropertyInMemory(BaseRole.prototype, "tasks", function() {
    return _.cloneDeep(this.constructor.TASKS);
});

utils.definePropertyInMemory(BaseRole.prototype, "parts", function() {
    return this.constructor.PARTS.slice();
});

utils.definePropertyInMemory(BaseRole.prototype, "partsCost", function() {
    return this.constructor.PARTS.reduce(function(partsCost, part) {
        return partsCost + BODYPART_COST[part];
    }, 0);
});

utils.definePropertyInMemory(BaseRole.prototype, "i", function() {
    return 0;
});

utils.definePropertyInMemory(BaseRole.prototype, "creeps", function() {
    return {};
});

utils.definePropertyInMemory(BaseRole.prototype, "creepsCount", function() {
    return 0;
});

utils.defineInstancePropertyByNameInMemory(BaseRole.property, "room", "rooms");


BaseRole.prototype.init = function(room) {
    this.room = room;
};

BaseRole.prototype.tick = function() {
    this.upgradeParts();

    this.spawnCreeps();

    this.executeCreepsTasks();
};

BaseRole.prototype.upgradeParts = function() {
    let newPart = this.constructor.MAIN_PARTS[this.i];

    //if the available energy capacity can accommodate the new part or if the parts has reached max parts count (50)
    while (this.room.energyCapacityAvailable >= this.partsCost + BODYPART_COST[newPart] + BODYPART_COST[MOVE] &&
           this.parts.length <= this.constructor.MAX_PARTS - 2) {
        //have the new part at the beginig and move at the end,
        //so that when the creep is damaged movement is the last thing to be damaged
        this.parts.unshift(newPart);
        this.parts.push(MOVE);
        this.partsCost += BODYPART_COST[newPart] + BODYPART_COST[MOVE];
        this.i = (this.i + 1) % this.constructor.MAIN_PARTS.length;

        //console.log("Upgraded the creeps parts to", this.parts.join(","));

        newPart = this.constructor.MAIN_PARTS[this.i];
    }
};

BaseRole.prototype.spawnCreeps = function() {
    //spawn creeps
    //console.log(this.creepsCount, this.getMaxCount(this.room, this));
    if (this.creepsCount < this.getMaxCount() && this.partsCost < this.room.energyAvailable) {
        let parts = this.parts.slice();
        let spawn = _.find(Game.spawns, (spawn) => {
            return !spawn.spawning;
        });

        let creepName = spawn.createCreep(parts, undefined, {role: { name : this.ROLE_NAME }});
        if (creepName > 0) {
            this.creeps[creepName] = 1;
            this.creepsCount++;
            this.room.fireEvents[constants.CREEP_CREATED] = 1;
        }
    }
};

BaseRole.prototype.executeCreepsTasks = function() {
    //execute creeps' tasks
    for (let creepName in this.creeps) {
        let creep = Game.creeps[creepName];

        if (creep) {
            if (!creep.spawning) {
                this.executeTask(creep);
            }
        }
        else if (Memory.creeps[creepName]) {
            //console.log("Creep", creepName, "died");
            Memory.creeps[creepName].name = creepName;
            this.creepHasDied(Memory.creeps[creepName]);
            delete Memory.creeps[creepName];
        }
    }
};

BaseRole.prototype.addCreep = function(creep) {
    if (creep.task) {
        creep.task.tasks = {};
        creep.task.tier = 0;
        delete creep.task.target;
        delete creep.task.targetType;
    }
    creep.role = {
        name : this.constructor.ROLE_NAME,
    };

    this.creeps[creep.name] = 1;
    this.creepsCount++;
    //console.log(creep.name, "added to", this.ROLE_NAME);
    this.assignNewTask(creep, true);
};

BaseRole.prototype.removeCreep = function(creep) {
    if (creep.task) {
        for (let tier in creep.task.tasks) {
            creep.task.tier = tier;
            this.clearTask(creep);
        }
    }
};

BaseRole.prototype.executeTask = function(creep) {
    //console.log(creep.name, creep.role.name, creep.task);
    if (creep.task) {
        let currentTask = this.constructor.TASKS[creep.task.tier][creep.task.current];
        if (currentTask) {
            let returnValue = this.tasksInfo[currentTask].execute(creep);
            switch (returnValue) {
                case ERR_INVALID_TARGET:
                case ERR_NO_BODYPART:
                case ERR_RCL_NOT_ENOUGH:
                this.reassignTask(creep);
                break;

                case ERR_NOT_ENOUGH_RESOURCES:
                case constants.ERR_INVALID_TASK:
                this.switchTask(creep);
                break;

                case OK:
                case ERR_BUSY:
                break;

                default:
                break;
            }
        }
        else {
            this.assignNewTask(creep);
        }
    }
    else {
        this.assignNewTask(creep, true);
    }
};

BaseRole.prototype.getMaxCount = function() {
    return this.room.sourceManager.totalAvailableSpaces * 3 / 2;
};

BaseRole.prototype.getMaxParts = function() {
    return this.MAX_PARTS;
};

BaseRole.prototype.isTaskFree = function(task, tier, offset) {
    return task.hasTarget;
};

BaseRole.prototype.assignTask = function(creep, task, taskIdx) {
    creep.task = creep.task || {
        tier : 0,
        tasks : {},
    };
    creep.task.current = taskIdx;
    creep.task.tasks[creep.task.tier] = taskIdx;

    //console.log("Assigning", creep.name, "to", this.constructor.TASKS[creep.task.tier][taskIdx]);
};

BaseRole.prototype.assignNewTask = function(this.room, creep, isNew) {
    let this = this.room.rolesInfo[creep.role.name];
    let tier = (isNew ? 0 : creep.task.tier);
    let tasks = this.constructor.TASKS[tier];
    let minCreepCount = 99999, minTaskIdx, minTask;
    let assigned = false;

    for (let i = 0; i < tasks.length; i++) {
        let task = this.room.tasksInfo[tasks[i]];
        if (minCreepCount > task.creepsCount) {
            minCreepCount = task.creepsCount;
            minTaskIdx = i;
            minTask = task;
        }
    }

    //console.log(creep.name, minTaskIdx);

    if (minTaskIdx >= 0) {
        this.assignTask(creep, minTask, minTaskIdx);
    }
};

BaseRole.prototype.clearTask = function(this.room, creep) {
    if (creep.task) {
        let this = this.room.rolesInfo[creep.role.name];
        let task = this.room.tasksInfo[this.constructor.TASKS[creep.task.tier][creep.task.current]];
        if (task && task.creeps[creep.name]) {
            //console.log("Clearing", creep.name, "from", this.constructor.TASKS[creep.task.tier][creep.task.current]);
            task.creepsCount--;
            delete task.creeps[creep.name];
        }
        else {
            //console.log("Trying to clear", creep.name, "of unassigned task");
        }
    }
};

BaseRole.prototype.switchTask = function(this.room, creep) {
    let this = this.room.rolesInfo[creep.role.name];
    creep.task.tier = (creep.task.tier + 1) % this.constructor.TASKS.length;
    creep.task.current = creep.task.tasks[creep.task.tier];
    //console.log("Switching to tier", creep.task.tier, "for", creep.name);
    if (creep.task.current == undefined) {
        this.assignNewTask(this.room, creep);
    }
};

BaseRole.prototype.reassignTask = function(this.room, creep) {
    //TODO
};

BaseRole.prototype.creepHasDied = function(this.room, creep, this) {
    this.clearTask(this.room, creep);
    if (this.creeps[creep.name]) {
        delete this.creeps[creep.name];
        this.creepsCount--;
    }
};

module.exports = BaseRole;
