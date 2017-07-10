let BaseTask = require("task.base");

/**
 * Upgrade and maintain the controller
 *
 * @module task
 * @class UpgradeTask
 * @extends BaseTask
 */

module.exports = BaseTask.extend({
    getTarget : function() {
        return this.room.controller;
    },

    getTargets : function() {
        return [this.room.controller.id];
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
