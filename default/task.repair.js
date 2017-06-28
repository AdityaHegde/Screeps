var build = require("task.build")

var repair = _.merge({}, build, {
    getTargets : function(spawn, taskInfo) {
        return spawn.room.find(FIND_STRUCTURES, {
            filter : structure => structure.hits < structure.hitsMax / 2
        }).map((target) => target.id);
    },

    doTask : function(worker, target) {
        return worker.repair(target);
    },

    isTargetValid : function(target) {
        return target && target.hits >= target.hitsMax;
    },
});

module.exports = repair;
