let baseTask = require("task.base");
let utils = require("utils");

/**
 * Task to harvest source
 *
 * @module task
 * @Class DropOff
 * @extends BaseTask
 */

module.exports = _.merge({}, baseTask, {
    tick : function(room, taskInfo) {
        taskInfo.hasTarget = true;
    },

    getTarget : function(room, creep, taskInfo) {
        if (!creep.source) {
            room.findSource().claim(creep);
        }
        return Game.getObjectById(creep.source);
    },

    updateTargets : function(room, taskInfo) {
        //dummy
    },

    getTargets : function(room, taskInfo) {
        //dummy
    },

    doTask : function(creep, target) {
        return creep.harvest(target);
    },

    isTaskValid : function(creep, target) {
        return creep.carry.energy < creep.carryCapacity;
    },

    creepHasDied : function(room, creep) {
        var source = Game.getObjectById(creep.source);
        if (source) {
            source.release(creep);
        }
    },
});
