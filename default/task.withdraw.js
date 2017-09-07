/* globals OK, RESOURCE_ENERGY */

let constants = require("constants");
let StoreTask = require("task.store");

/**
 * Task to withdraw energy from containers
 *
 * @module task
 * @class Withdraw
 * @extends StoreTask
 */

module.exports = StoreTask.extend({
    doTask: function (creep, target) {
        let returnValue = creep.withdraw(target, RESOURCE_ENERGY);
        if (returnValue === OK && target.store && target.store.energy === target.storeCapacity) {
            this.room.fireEvent(constants.ENERGY_WITHDRAWN, target);
        }
        return returnValue;
    },

    isTaskValid: function (creep, target) {
        return creep.carry.energy < creep.carryCapacity;
    },

    isTargetValid: function (target) {
        return target.store && target.store.energy > 0;
    },

    isAssignedTargetValid: function (target) {
        return (target.store.energy - this.targetsMap[target.id]) > 0;
    }
}, {
    UPDATE_TARGET_EVENTS: [constants.ENERGY_STORED, constants.PERIODIC_10_TICKS],
    UPDATE_POTENTIAL_TARGETS_EVENTS: [constants.CONTAINER_BUILT],
    TASK_NAME: "withdraw"
});
