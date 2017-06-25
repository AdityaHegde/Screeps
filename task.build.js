var build = {
    initSpawn : function(spawn, taskInfo) {
    },

    tick : function(spawn, taskInfo) {
        if (taskInfo.targets.length == 0 ||
            (taskInfo.currentTarget && !this.isTargetValid(Game.getObjectById(taskInfo.currentTarget)))) {
            taskInfo.targets = this.getTargets(spawn, taskInfo);
            taskInfo.currentTarget = null;
        }

        if (!taskInfo.currentTarget) {
            taskInfo.currentTarget = taskInfo.targets[0];
        }
    },

    getTarget : function(spawn, taskInfo) {
        return Game.getObjectById(taskInfo.currentTarget);
    },

    getTargets : function(spawn, taskInfo) {
        return spawn.room.find(FIND_CONSTRUCTION_SITES).map((target) => target.id);
    },

    execute : function(spawn, worker, taskInfo) {
        var target = this.getTarget(spawn, taskInfo);
        //if the target is not in range, move the worker to it
        if (this.doTask(worker, target) == ERR_NOT_IN_RANGE) {
            worker.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    },

    doTask : function(worker, target) {
        return worker.build(target);
    },

    isTargetValid : function(target) {
        return !!target;
    },
};

module.exports = build;
