module.exports = {
    initSpawn : function(spawn, taskInfo) {
    },

    tick : function(spawn, taskInfo) {
        taskInfo.hasUpdatedTargets = false;
        if (taskInfo.targets.length == 0) {
            this.updateTargets(spawn, taskInfo);
        }
    },

    getTarget : function(spawn, worker, taskInfo) {
        var target = Game.getObjectById(worker.memory.task.target);
        if (!target || !this.isTargetValid(target)) {
            this.updateTargets(spawn, taskInfo);
            target = taskInfo.targets[0];
            worker.memory.task.target = target && target.id;
        }
        return target;
    },

    updateTargets : function(spawn, taskInfo) {
        if (!taskInfo.hasUpdatedTargets) {
            taskInfo.targets = this.getTargets(spawn, taskInfo);
            taskInfo.hasTarget = taskInfo.targets.length > 0;
            taskInfo.hasUpdatedTargets = true;
        }
    },

    getTargets : function(spawn, taskInfo) {
        return spawn.room.find(FIND_CONSTRUCTION_SITES).map((target) => target.id);
    },

    execute : function(spawn, worker, taskInfo) {
        var target = this.getTarget(spawn, taskInfo);
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
