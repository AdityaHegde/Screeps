let BaseTask = require("task.base");

/**
 * Upgrade and maintain the controller
 *
 * @module task
 * @class StoreTask
 * @extends BaseTask
 */

module.exports = BaseTask.extend({
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
}, {
    TASK_NAME : "upgrade",
});
