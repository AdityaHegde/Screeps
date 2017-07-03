var baseTask = require("task.base");
var constants = require("constants");

/**
 * Task to repair structures
 *
 * @module task
 * @Class RepairTask
 * @extends BaseTask
 */

var repair = _.merge({}, baseTask, {
    LISTEN_EVENT : constants.STRUCURE_BUILT,

    updateTargets : function(room, taskInfo) {
        //add new targets from
        taskInfo.targets = this.getTargets(room, taskInfo);
        taskInfo.hasTarget = taskInfo.targets.length > 0;
    },

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
