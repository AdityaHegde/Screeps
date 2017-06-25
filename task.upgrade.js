var _ = require("lodash");
var taskBuild = require("task.build");

var upgrade = _.merge({}, taskBuild, {
    getTarget : function(spawn) {
        return spawn.room.controller;
    },

    getTargets : function(spawn) {
        return [spawn.room.controller.id];
    },

    doTask : function(worker, target) {
        return worker.upgradeController(target);
    },

    isTargetValid : function(target) {
        //TODO
        return true;
    },
});

module.exports = upgrade;
