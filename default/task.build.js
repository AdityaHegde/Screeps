var constants = require("constants");

module.exports = {
    init : function(room, taskInfo) {
    },

    tick : function(room, taskInfo) {
        taskInfo.hasUpdatedTargets = false;
        if (room.memory.listenEvents[constants.CONSTRUCTION_SITE_ADDED]) {
            this.updateTargets(room, taskInfo);
        }
    },

    getTarget : function(room, worker, taskInfo) {
        var target = Game.getObjectById(worker.memory.task.target);
        if (!target || !this.isTargetValid(target)) {
            this.updateTargets(room, taskInfo);
            target = taskInfo.targets[0];
            worker.memory.task.target = target && target.id;
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
        return room.room.find(FIND_CONSTRUCTION_SITES).map((target) => target.id);
    },

    execute : function(room, worker, taskInfo) {
        var target = this.getTarget(room, taskInfo);
        //if there was no target found for this task
        if (!target) {
            return ERR_INVALID_TARGET;
        }
        var returnValue = this.doTask(worker, target);
        //if the target is not in range, move the worker to it
        if (returnValue == ERR_NOT_IN_RANGE) {
            return worker.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
        //return false if there is no enough resources,
        //returning false will make the manager assign to next task in queue
        return returnValue;
    },

    doTask : function(worker, target) {
        return worker.build(target);
    },

    isTargetValid : function(target) {
        return true;
    },

    workerHasDied : function() {},
};
