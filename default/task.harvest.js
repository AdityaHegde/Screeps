let baseTask = require("task.base");
let utils = require("utils")

module.exports = _.merge({}, baseTask, {
    tick : function(room, taskInfo) {
        taskInfo.hasTarget = true;
    },

    getTarget : function(room, creep, taskInfo) {
        if (!creep.assignedSource) {
            room.findSource().claim(creep);
        }
        return Game.getObjectById(creep.assignedSource);
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

    creepHasDied : function(room, creep) {
        var source = Game.getObjectById(creep.assignedSource);
        source && source.release(creep);
    },
});
