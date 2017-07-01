var _ = require("lodash");
var taskBuild = require("task.build");

var upgrade = _.merge({}, taskBuild, {
    getTarget : function(room) {
        return room.controller;
    },

    getTargets : function(room) {
        return [room.controller.id];
    },

    doTask : function(creep, target) {
        return creep.upgradeController(target);
    },

    isTargetValid : function(target) {
        //TODO
        return true;
    },
});

module.exports = upgrade;
