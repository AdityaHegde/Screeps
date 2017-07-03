var constants = require("constants");
var baseTask = require("task.base")

/**
 * Task to drop off energy to spawn, extension or other structures that take energy (TODO)
 *
 * @module task
 * @Class BuildTask
 * @extends BaseTask
 */

module.exports = _.merge({}, baseTask, {
    LISTEN_EVENT : constants.CONSTRUCTION_SITE_ADDED,

    getTargets : function(room, taskInfo) {
        return room.find(FIND_CONSTRUCTION_SITES).map((target) => target.id);
    },

    doTask : function(creep, target) {
        creep.task.targetType = target.structureType;
        return creep.build(target);
    },
});
