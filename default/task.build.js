var constants = require("constants");
var baseTask = require("task.base");

var TYPE_TO_EVENT = {
    [STRUCURE_CONTAINER] : constants.CONTAINER_BUILT,
    [STRUCURE_EXTENSION] : constants.EXTENSION_BUILT,
    [STRUCURE_WALL] : constants.WALL_BUILT,
    [STRUCURE_TOWER] : constants.TOWER_BUILT,
};

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

    updateTargets : function(room, taskInfo) {
        //add new targets from
        taskInfo.targets = this.getTargets(room, taskInfo);
        taskInfo.hasTarget = taskInfo.targets.length > 0;
    },

    doTask : function(creep, target) {
        creep.task.targetType = target.structureType;
        creep.task.targetPos = {
            x : target.pos.x,
            y : target.pos.y,
        };
        return creep.build(target);
    },

    targetIsInvalid : function(room, creep, target, taskInfo) {
        if (creep.task.targetType) {
            var newTarget = target || room.lookForAt(LOOK_STRUCTURES, creep.task.targetPos.x, creep.task.targetPos.y)[0];
            if (creep.task.targetType && TYPE_TO_EVENT[creep.task.targetType]) {
                this.fireEvents[TYPE_TO_EVENT[creep.task.targetType]] = this.fireEvents[TYPE_TO_EVENT[creep.task.targetType]] || [];
                this.fireEvents[TYPE_TO_EVENT[creep.task.targetType]].push(target.id);
            }
            this.fireEvents[constants.STRUCURE_BUILT] = this.fireEvents[constants.STRUCURE_BUILT] || [];
            this.fireEvents[constants.STRUCURE_BUILT].push(target.id);
        }
    },
});
