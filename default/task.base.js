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

let BaseTask = BaseClass("task");

BaseTask.EVENT_LISTENERS = [];
BaseTask.UPDATE_TARGET_EVENTS = [];
BaseTask.TASK_NAME = "base";

BaseTask.init = function() {
    this.EVENT_LISTENERS.forEach((eventListener) => {
        eventBus.subscribe(eventListener.eventName, this.prototype[eventListener.method], "tasksInfo." + this.TASK_NAME);
    });
    this.UPDATE_TARGET_EVENTS.forEach((eventListener) => {
        eventBus.subscribe(eventListener.eventName, this.prototype.updateTargets, "tasksInfo." + this.TASK_NAME);
    });
};

BaseTask.__staticMembers = ["EVENT_LISTENERS", "UPDATE_TARGET_EVENTS", "TASK_NAME", "init"];

utils.definePropertyInMemory(BaseTask.prototype, "targets", function() {
    return [];
});

utils.definePropertyInMemory(BaseTask.prototype, "hasTarget", function() {
    return false;
});

utils.defineInstancePropertyByNameInMemory(BaseRole.property, "room", "rooms");

BaseTask.prototype.init = funciton(room) {
    this.room = room;
    this.targets = this.getTargets();
    this.hasTarget = this.targets.length > 0;
};

BaseTask.prototype.tick = funciton() {
};

BaseTask.prototype.getTarget = funciton(creep) {
    if (!creep.task.target) {
        //if there is no current target, get one closest
        creep.task.target = utils.getClosestObject(creep, this.targets);
    }
    let target = Game.getObjectById(creep.task.target);
    if (!target || !this.isTargetValid(target)) {
        this.targetIsInvalid(creep, target);
        //if target is invalid, remove it from targets of the task and get a new closest target
        this.targets = _.pull(this.targets, creep.task.target);
        this.hasTarget = this.targets.length > 0;
        creep.task.target = utils.getClosestObject(creep, this.targets);
        target = Game.getObjectById(creep.task.target);
    }
    return target;
};

BaseTask.prototype.updateTargets = funciton(newTargets) {
    //add new targets from event
    this.targets.push(...newTargets.map(newTarget => newTarget.id));
    this.hasTarget = this.targets.length > 0;
};

BaseTask.prototype.getTargets = funciton() {
    return [];
};

BaseTask.prototype.execute = funciton(creep) {
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
    let returnValue = this.doTask(creep, target);
    //if the target is not in range, move the creep to it
    if (returnValue == ERR_NOT_IN_RANGE) {
        return creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
    }
    //return false if there is no enough resources,
    //returning false will make the manager assign to next task in queue
    return returnValue;
};

BaseTask.prototype.doTask = funciton(creep, target) {
    return OK;
};

BaseTask.prototype.isTaskValid = funciton(creep, target) {
    return this.isTargetValid(target);
};

BaseTask.prototype.isTargetValid = funciton(target) {
    return true;
};

BaseTask.prototype.targetIsInvalid = funciton(creep, target) {
};

BaseTask.prototype.creepHasDied = funciton() {},
};

module.exports = BaseTask;
