var storeTask = require("task.store");

/**
 * Task to withdraw energy from containers
 *
 * @module task
 * @Class Withdraw
 * @extends StoreTask
 */

module.exports = _.assign({}, storeTask, {
    doTask : function(creep, target) {
        return creep.withdraw(target, RESOURCE_ENERGY);
    },

    isTaskValid : function(creep, target) {
        return creep.carry.energy == creep.carryCapacity;
    },

    isTargetValid : function(target) {
        return target.store && target.store.energy > 0;
    },
});
