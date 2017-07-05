var utils = require("utils");
var constants = require("constants");

/**
 * Base task class
 *
 * @module task
 * @Class BaseTask
 */

module.exports = {
    TARGETS_EVENT : "",

    init : function(room, taskInfo) {
        room.listenEvents[this.TARGETS_EVENT] = this.getTargets(room, taskInfo);
        taskInfo.targets = this.getTargets(room, taskInfo);
        taskInfo.hasTarget = taskInfo.targets.length > 0;
    },

    tick : function(room, taskInfo) {
        if (room.listenEvents[this.TARGETS_EVENT]) {
            this.updateTargets(room, taskInfo);
        }
    },

    getTarget : function(room, creep, taskInfo) {
        if (!creep.task.target) {
            //if there is no current target, get one closest
            creep.task.target = utils.getClosestObject(creep, taskInfo.targets);
        }
        var target = Game.getObjectById(creep.task.target);
        if (!target || !this.isTargetValid(target)) {
            this.targetIsInvalid(room, creep, target, taskInfo);
            //if target is invalid, remove it from targets of the task and get a new closest target
            taskInfo.targets = _.pull(taskInfo.targets, creep.task.target);
            taskInfo.hasTarget = taskInfo.targets.length > 0;
            creep.task.target = utils.getClosestObject(creep, taskInfo.targets);
            target = Game.getObjectById(creep.task.target);
        }
        return target;
    },

    updateTargets : function(room, taskInfo) {
        //console.log(room.listenEvents[this.TARGETS_EVENT].join(","));
        //add new targets from event
        taskInfo.targets.push(...room.listenEvents[this.TARGETS_EVENT]);
        taskInfo.targets = _.uniq(taskInfo.targets);
        taskInfo.hasTarget = taskInfo.targets.length > 0;
        //console.log(taskInfo.hasTarget);
    },

    getTargets : function(room, taskInfo) {
        return [];
    },

    execute : function(room, creep, taskInfo) {
        var target = this.getTarget(room, creep, taskInfo);
        //console.log(creep.name, target);
        //if there was no target found for this task
        if (!target) {
            return ERR_INVALID_TARGET;
        }
        //if the current task became invalid, return ERR_INVALID_TASK
        if (!this.isTaskValid(creep, target)) {
            return constants.ERR_INVALID_TASK;
        }
        var returnValue = this.doTask(creep, target);
        //if the target is not in range, move the creep to it
        if (returnValue == ERR_NOT_IN_RANGE) {
            return creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
        //return false if there is no enough resources,
        //returning false will make the manager assign to next task in queue
        return returnValue;
    },

    doTask : function(creep, target) {
        return OK;
    },

    isTaskValid : function(creep, target) {
        return this.isTargetValid(target);
    },

    isTargetValid : function(target) {
        return true;
    },

    targetIsInvalid : function(room, creep, target, taskInfo) {
    },

    creepHasDied : function() {},
};
