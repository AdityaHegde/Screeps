let constants = require("constants");
let BaseTask = require("task.base");

/**
 * Task to repair structures
 *
 * @module task
 * @class RepairTask
 * @extends BaseTask
 */

module.exports = BaseTask.extend({
    updateTargets : function() {
        this.targets = this.getTargets();
        this.hasTarget = this.targets.length > 0;
    },

    getTargets : function() {
        return this.room.find(FIND_STRUCTURES, {
            filter : structure => structure.hits < structure.hitsMax / 2
        }).map((target) => target.id);
    },

    doTask : function(creep, target) {
        return creep.repair(target);
    },

    isTargetValid : function(target) {
        return target && target.hits >= target.hitsMax;
    },
}, {
    UPDATE_TARGET_EVENTS : [constants.PERIODIC_10_TICKS],
    TASK_NAME : "repair",
});
