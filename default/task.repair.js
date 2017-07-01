var build = require("task.build")

var repair = _.merge({}, build, {
    getTargets : function(room, taskInfo) {
        return room.find(FIND_STRUCTURES, {
            filter : structure => structure.hits < structure.hitsMax / 2
        }).map((target) => target.id);
    },

    doTask : function(creep, target) {
        return creep.repair(target);
    },

    isTargetValid : function(target) {
        return target && target.hits >= target.hitsMax;
    },
});

module.exports = repair;
