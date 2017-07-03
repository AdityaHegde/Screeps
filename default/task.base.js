var utils = require("utils");

/**
 * Base task class
 *
 * @module task
 * @Class BaseTask
 */

module.exports = {
    LISTEN_EVENT : "",

    init : function(room, taskInfo) {
        room.listenEvents[this.LISTEN_EVENT] = this.getTargets(room, taskInfo);
        this.updateTargets(room, taskInfo);
    },

    tick : function(room, taskInfo) {
        if (room.listenEvents[this.LISTEN_EVENT]) {
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
            //if target is invalid, remove it from targets of the task and get a new closest target
            _.pull(taskInfo.targets, creep.task.target);
            creep.task.target = utils.getClosestObject(creep, taskInfo.targets);
            target = Game.getObjectById(creep.task.target);
        }
        return target;
    },

    updateTargets : function(room, taskInfo) {
        //add new targets from
        taskInfo.targets.push(...room.listenEvents[this.LISTEN_EVENT]);
        taskInfo.hasTarget = taskInfo.targets.length > 0;
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

    creepHasDied : function() {},
};
