let constants = require("constants");
let BaseTask = require("task.base");

/**
 * Task to harvest source
 *
 * @module task
 * @class HarvestTask
 * @extends BaseTask
 */

module.exports = BaseTask.extend({
    tick : function() {
        this.hasTarget = true;
    },

    getTarget : function(creep) {
        if (!creep.task.source) {
            this.room.findSource().claim(creep);
        }
        return Game.getObjectById(creep.task.source);
    },

    updateTargets : function() {
        //dummy
    },

    getTargets : function() {
        return [];
    },

    doTask : function(creep, target) {
        return creep.harvest(target);
    },

    isTaskValid : function(creep, target) {
        return creep.carry.energy < creep.carryCapacity;
    },

    creepHasDied : function(creep) {
        let source = Game.getObjectById(creep.task.source);
        if (source) {
            source.release(creep);
        }
    },
}, {
    EVENT_LISTENERS : [],
    UPDATE_TARGET_EVENTS : [],
    TASK_NAME : "harvest",
});
