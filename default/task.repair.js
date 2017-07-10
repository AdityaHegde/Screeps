let constants = require("constants");
let BuildTask = require("task.build");

/**
 * Task to repair structures
 *
 * @module task
 * @class RepairTask
 * @extends BuildTask
 */

module.exports = BuildTask.extend({
    updateTargetsMap : function() {
        this.getTargets().forEach((target) => {
            this.targetsMap[target] = this.targetsMap[target] || 0;
        });
        this.hasTarget = Object.keys(this.targetsMap).length > 0;
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

    isAssignedTargetValid : function(target) {
        return (target.maxHits - target.hits - this.targetsMap[target.id]) > 0;
    },
}, {
    UPDATE_TARGET_EVENTS : [constants.PERIODIC_10_TICKS],
    TASK_NAME : "repair",
});
