var constants = require("constants");
var withdrawTask = require("task.withdraw");

/**
 * Store in containers
 *
 * @module task
 * @Class WithdrawUpgraderTask
 * @extends WithdrawTask
 */

module.exports = _.assign({}, withdrawTask, {
    POTENTIAL_TARGETS_EVENT : constants.CONTAINER_BUILT,
    TARGETS_EVENT : "",

    getPotentialTargets : function(room) {
        return room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_CONTAINER && structure.label == constants.UPGRADER_STORAGE;
            },
        }).map((structure) => structure.id);
    },
});
