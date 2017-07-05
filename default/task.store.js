var constants = require("constants");
var dropoffTask = require("task.dropoff");

/**
 * Store in containers
 *
 * @module task
 * @Class StoreTask
 * @extends DropOffTask
 */

module.exports = _.assign({}, dropoffTask, {
    POTENTIAL_TARGETS_EVENT : constants.CONTAINER_BUILT,
    TARGETS_EVENT : constants.CONTAINER_BUILT,

    getPotentialTargets : function(room) {
        return room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_CONTAINER && structure.label == constants.HARVESTER_STORAGE;
            },
        }).map((structure) => structure.id);
    },

    updatePotentialTargets : function(room, taskInfo) {
        taskInfo.potentialTargets = this.getPotentialTargets(room);
        taskInfo.potentialTargets = _.uniq(taskInfo.potentialTargets);
    },

    isTargetValid : function(target) {
        return target.store.energy < target.energyCapacity;
    },
});
