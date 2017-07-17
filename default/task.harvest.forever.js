let constants = require("constants");
let HarvestTask = require("task.harvest");

/**
 * Task to harvest source forever. Creep will not have CARRY body part.
 *
 * @module task
 * @class HarvestForeverTask
 * @extends HarvestTask
 */

module.exports = HarvestTask.extend({
    doTask : function(creep, target) {
        if (creep.pos.x == target.container.x && creep.pos.y == target.container.y) {
            return creep.harvest(target);
        }
        else {
            return creep.moveTo(target.container);
        }
    },

    isTaskValid : function(creep, target) {
        return true;
    },
}, {
    EVENT_LISTENERS : [],
    UPDATE_TARGET_EVENTS : [],
    TASK_NAME : "harvestForever",
});
