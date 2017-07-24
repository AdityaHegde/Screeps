let utils = require("utils");
let constants = require("constants");
let BaseClass = require("base.class");
let eventBus = require("event.bus");

/**
* Base task class
*
* @module task
* @class BaseTask
*/

let BaseTask = BaseClass("task", "tasks");

BaseTask.EVENT_LISTENERS = [];
BaseTask.UPDATE_TARGET_EVENTS = [];
BaseTask.TASK_NAME = "base";

BaseTask.init = function() {
    this.EVENT_LISTENERS.forEach((eventListener) => {
        eventBus.subscribe(eventListener.eventName, eventListener.method, "tasksInfo." + this.TASK_NAME);
    });
    this.UPDATE_TARGET_EVENTS.forEach((eventListener) => {
        eventBus.subscribe(eventListener, "updateTargetsMap", "tasksInfo." + this.TASK_NAME);
    });
};

BaseTask.__staticMembers = {
    "EVENT_LISTENERS" : 1,
    "UPDATE_TARGET_EVENTS" : 1,
    "TASK_NAME" : 1,
    "init" : 1,
};

utils.definePropertyInMemory(BaseTask, "targetsMap", function() {
    return {};
});

utils.definePropertyInMemory(BaseTask, "hasTarget", function() {
    return false;
});

utils.definePropertyInMemory(BaseTask, "creeps", function() {
    return {};
});

utils.definePropertyInMemory(BaseTask, "creepsCount", function() {
    return 0;
});

//utils.defineInstancePropertyByNameInMemory(BaseTask, "room", "rooms");

BaseTask.prototype.init = function(room) {
    this.room = room;
    this.updateTargetsMap();
    this.hasTarget = Object.keys(this.targetsMap).length > 0;
};

BaseTask.prototype.tick = function() {
};

BaseTask.prototype.getTarget = function(creep) {
    let target;
    if (!creep.task.targets[creep.task.tier]) {
        target = this.assignNewTarget(creep);
    }
    else {
        target = Game.getObjectById(creep.task.targets[creep.task.tier]);
    }
    if (!target || !this.isTargetValid(target)) {
        this.targetIsInvalid(creep, target);
        //if target is invalid, remove it from targets of the task and get a new target
        delete this.targetsMap[creep.task.targets[creep.task.tier]];
        target = this.assignNewTarget(creep);
    }
    this.hasTarget =  Object.keys(this.targetsMap).length > 0;
    return target;
};

BaseTask.prototype.assignNewTarget = function(creep) {
    //get the closest target
    let target = utils.getClosestObject(creep, Object.keys(this.targetsMap), (target) => {
        //filter out targets that are assgined to other creeps and are not valid for more
        //eg : creepA is picking up 50 energy from a container with 50 energy.
        //     creepB cannot pickup from the same container as there wont be energy left after creepA is done picking up
        return this.isAssignedTargetValid(target);
    });
    if (target) {
        creep.task.targets[creep.task.tier] = target.id;
        this.targetIsClaimed(creep, target);
    }
    return target;
};

BaseTask.prototype.updateTargetsMap = function(newTargets) {
    if (!newTargets || newTargets == 1) {
        //force updating targets
        this.targetsMap = this.getTargetsMap();
    }
    else {
        //add new targets from event
        newTargets.forEach((target) =>{
            if (this.targetsFilter(target)) {
                this.targetsMap[target.id] = 0;
            }
        });
    }
    this.hasTarget = Object.keys(this.targetsMap).length > 0;
};

BaseTask.prototype.getTargetsMap = function() {
    let targetsMap = {};
    this.getTargets().forEach((target) => {
        targetsMap[target] = 0;
    });
    return targetsMap;
};

BaseTask.prototype.getTargets = function() {
    return [];
};

BaseTask.prototype.targetsFilter = function(target) {
    return true;
};

BaseTask.prototype.execute = function(creep) {
    creep.processed = true;
    let target = this.getTarget(creep);
    //console.log(creep.name, target);
    //if there was no target found for this task
    if (!target) {
        return ERR_INVALID_TARGET;
    }
    //if the current task became invalid, return ERR_INVALID_TASK
    if (!this.isTaskValid(creep, target)) {
        return constants.ERR_INVALID_TASK;
    }
    //if the creep has already reached target or it will in this tick, do the task
    if (this.room.pathManager.moveCreep(creep, target) == constants.CREEP_REACHED_TARGET) {
        let returnValue = this.doTask(creep, target);
        if (returnValue == OK) {
            this.taskExecuted(creep, target);
        }
        return returnValue;
    }
    return OK;
};

BaseTask.prototype.doTask = function(creep, target) {
    return OK;
};

BaseTask.prototype.taskExecuted = function(creep, target) {
};

BaseTask.prototype.taskStarted = function(creep) {
    if (creep.task && creep.task.targets && creep.task.targets[creep.task.tier]) {
        let target = Game.getObjectById(creep.task.targets[creep.task.tier]);
        if (target) {
            if (this.isAssignedTargetValid(target)) {
                this.targetIsClaimed(creep, target);
            }
            else {
                creep.task.targets[creep.task.tier] = null;
            }
        }
    }
};

BaseTask.prototype.taskEnded = function(creep) {
    if (creep.task && creep.task.targets && creep.task.targets[creep.task.tier]) {
        let target = Game.getObjectById(creep.task.targets[creep.task.tier]);
        if (target.moveAway) {
            this.room.pathManager.moveCreepTowards(creep, target, false);
        }
        if (target) {
            this.targetIsReleased(creep, target);
        }
    }
};

BaseTask.prototype.isTaskValid = function(creep, target) {
    return this.isTargetValid(target);
};

BaseTask.prototype.isTargetValid = function(target) {
    return true;
};

BaseTask.prototype.targetIsClaimed = function(creep, target) {
};

BaseTask.prototype.targetIsReleased = function(creep, target) {
};

BaseTask.prototype.targetIsInvalid = function(creep, target) {
};

BaseTask.prototype.isAssignedTargetValid = function(target) {
};

BaseTask.prototype.creepHasDied = function(creep) {
    this.taskEnded(creep);
};

module.exports = BaseTask;
