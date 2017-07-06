let constants = require("constants");
let DropOffTask = require("task.store");

/**
 * Supply to upgrader container and towers
 *
 * @module task
 * @class SupplyTask
 * @extends DropOffTask
 */

module.exports = DropOffTask.extend({
    getPotentialTargets : function(room) {
        return room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER && structure.label == constants.UPGRADER_STORAGE) ||
                       structure.structureType == STRUCTURE_TOWER;
            },
        }).map((structure) => structure.id);
    },

    updatePotentialTargets : function(newPotentialTargets) {
        this.potentialTargets.push(...newPotentialTargets.filter((structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER && structure.label == constants.UPGRADER_STORAGE) ||
                   structure.structureType == STRUCTURE_TOWER;
        }).map(newPotentialTarget => newPotentialTarget.id));
        this.updateTargets();
    },
}, {
    UPDATE_TARGET_EVENTS : [constants.ENERGY_WITHDRAWN, constants.TOWER_USED_ENERGY],
    UPDATE_POTENTIAL_TARGETS_EVENTS : [constants.CONTAINER_BUILT, constants.TOWER_BUILT],
    TASK_NAME : "supply",
});
