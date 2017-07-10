let constants = require("constants");
let DropOffTask = require("task.dropoff");

/**
 * Store in containers
 *
 * @module task
 * @class StoreTask
 * @extends DropOffTask
 */

//TODO block target switching, so that harvesters store in containers assigned and wait until its empty
module.exports = DropOffTask.extend({
    doTask : function(creep, target) {
        let returnValue = creep.transfer(target, RESOURCE_ENERGY);
        if (returnValue == OK && target.store && target.store.energy == 0) {
            this.room.fireEvent(constants.ENERGY_STORED, target);
        }
        return returnValue;
    },

    potentialTargetsFilter : function(structure) {
        return structure.structureType == STRUCTURE_CONTAINER && structure.label == constants.HARVESTER_STORAGE;
    },
}, {
    UPDATE_TARGET_EVENTS : [constants.ENERGY_WITHDRAWN],
    UPDATE_POTENTIAL_TARGETS_EVENTS : [constants.CONTAINER_BUILT],
    TASK_NAME : "store",
});
