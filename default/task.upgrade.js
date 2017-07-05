var _ = require("lodash");
var baseTask = require("task.base");

/**
 * Upgrade and maintain the controller
 *
 * @module task
 * @Class StoreTask
 * @extends BaseTask
 */

var upgrade = _.assign({}, baseTask, {
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
