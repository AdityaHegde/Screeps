var constants = require("constants");

module.exports = {
    init : function(room, taskInfo) {
    },

    tick : function(room, taskInfo) {
        if (taskInfo.targets.length == 0) {
            this.updateTargets(room, taskInfo);
        }
        taskInfo.hasTarget = taskInfo.targets.length > 0;
    },

    getTarget : function(room, creep, taskInfo) {
        if (!creep.task.target) {
            creep.task.target = taskInfo.targets[0];
        }
        var target = Game.getObjectById(creep.task.target);
        if (!target || !this.isTargetValid(target)) {
            this.updateTargets(room, taskInfo);
            target = taskInfo.targets[0];
            creep.task.target = Game.getObjectById(target && target.id);
        }
        return target;
    },

    updateTargets : function(room, taskInfo) {
        if (!taskInfo.hasUpdatedTargets) {
            taskInfo.targets = this.getTargets(room, taskInfo);
            taskInfo.hasTarget = taskInfo.targets.length > 0;
            taskInfo.hasUpdatedTargets = true;
        }
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
