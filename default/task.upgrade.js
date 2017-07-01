var _ = require("lodash");
var baseTask = require("task.base");

var upgrade = _.merge({}, baseTask, {
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
