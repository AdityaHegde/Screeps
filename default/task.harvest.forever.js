let HarvestTask = require("task.harvest");

/**
 * Task to harvest source forever. Creep will not have CARRY body part.
 *
 * @module task
 * @class HarvestForeverTask
 * @extends HarvestTask
 */

module.exports = HarvestTask.extend({
    isTaskValid: function (creep, target) {
        return true;
    },

    getTargetForMovement: function (creep, target) {
        return target;
    }
}, {
    EVENT_LISTENERS: [],
    UPDATE_TARGET_EVENTS: [],
    TASK_NAME: "harvestForever"
});
