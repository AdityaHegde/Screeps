/* globals RoomPosition */

let BaseTask = require("task.base");

/**
 * Give vision in the new room until a structure is built.
 *
 * @module task
 * @class GiveVisionTask
 * @extends BaseTask
 */

module.exports = BaseTask.extend({
    execute: function (creep) {
        return creep.moveTo(new RoomPosition(25, 25, creep.task.target), {
            reusePath: 15 + 10 * (creep.room.name === creep.task.target)
        });
    }
}, {
    TASK_NAME: "giveVision"
});
