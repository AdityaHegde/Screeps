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
    getPotentialTargets : function(room) {
        return room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_CONTAINER && structure.label == constants.HARVESTER_STORAGE;
            },
        }).map((structure) => structure.id);
    },

    isTargetValid : function(target) {
        return target.store.energy < target.energyCapacity;
    },
}, {
    UPDATE_TARGET_EVENTS : [constants.ENERGY_WITHDRAWN],
    UPDATE_POTENTIAL_TARGETS_EVENTS : [constants.CONTAINER_BUILT],
    TASK_NAME : "store",
});
