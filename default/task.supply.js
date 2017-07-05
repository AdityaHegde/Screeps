var constants = require("constants");
var storeTask = require("task.store");

/**
 * Store in containers
 *
 * @module task
 * @Class SupplyTask
 * @extends StoreTask
 */

module.exports = _.assign({}, storeTask, {
    getPotentialTargets : function(room) {
        return room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER && structure.label == constants.UPGRADER_STORAGE) ||
                       structure.structureType == STRUCTURE_TOWER;
            },
        }).map((structure) => structure.id);
    },
});
