/* globals STRUCTURE_CONTAINER */

let constants = require("constants");
let WithdrawTask = require("task.withdraw");

/**
 * Withdraw from container designated for upgrade
 *
 * @module task
 * @class WithdrawUpgraderTask
 * @extends WithdrawTask
 */

module.exports = WithdrawTask.extend({
    potentialTargetsFilter: function (structure) {
        return structure.structureType === STRUCTURE_CONTAINER && structure.label === constants.UPGRADER_STORAGE;
    }
}, {
    UPDATE_TARGET_EVENTS: [constants.ENERGY_STORED],
    UPDATE_POTENTIAL_TARGETS_EVENTS: [constants.CONTAINER_BUILT],
    TASK_NAME: "withdrawUpgrader"
});
