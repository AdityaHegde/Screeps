var storeTask = require("task.store");

/**
 * Task to withdraw energy from containers
 *
 * @module task
 * @Class Withdraw
 * @extends StoreTask
 */

module.exports = _.merge({}, storeTask, {
    doTask : function(creep, target) {
        return creep.withdraw(target, RESOURCE_ENERGY);
    },
});
