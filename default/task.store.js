var constants = require("constants");
var baseTask = require("task.base");

/**
 * Store in containers
 *
 * @module task
 * @Class StoreTask
 * @extends BaseTask
 */

module.exports = _.merge({}, baseTask, {
    LISTEN_EVENT : constants.CONTAINER_BUILT,

    getTargets : function(room, taskInfo) {
        return room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_CONTAINER;
            },
        }).map((structure) => structure.id);
    },

    doTask : function(creep, target) {
        return creep.transfer(target, RESOURCE_ENERGY);
    },

    isTaskValid : function(creep, target) {
        return creep.carry.energy > 0;
    },
});
