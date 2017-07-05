let baseTask = require("task.base");
let utils = require("utils");

/**
 * Task to harvest source
 *
 * @module task
 * @Class DropOff
 * @extends BaseTask
 */

module.exports = _.assign({}, baseTask, {
    tick : function(room, taskInfo) {
        taskInfo.hasTarget = true;
    },

    getTarget : function(room, creep, taskInfo) {
        if (!creep.task.source) {
            room.findSource().claim(creep);
        }
        return Game.getObjectById(creep.task.source);
    },

    updateTargets : function(room, taskInfo) {
        //dummy
    },

    getTargets : function(room, taskInfo) {
        return [];
    },

    doTask : function(creep, target) {
        return creep.harvest(target);
    },

    isTaskValid : function(creep, target) {
        return creep.carry.energy < creep.carryCapacity;
    },

    creepHasDied : function(room, creep) {
        var source = Game.getObjectById(creep.task.source);
        if (source) {
            source.release(creep);
        }
    },
});
