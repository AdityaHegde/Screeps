let constants = require("constants");
let BaseTask = require("task.base");

let TYPE_TO_EVENT = {
    [STRUCTURE_CONTAINER] : constants.CONTAINER_BUILT,
    [STRUCTURE_EXTENSION] : constants.EXTENSION_BUILT,
    [STRUCTURE_WALL] : constants.WALL_BUILT,
    [STRUCTURE_TOWER] : constants.TOWER_BUILT,
};

let STRUCURE_TYPE_TO_PLANNER = {
    [STRUCTURE_CONTAINER] : "container",
};

/**
 * Task to drop off energy to spawn, extension or other structures that take energy (TODO)
 *
 * @module task
 * @class BuildTask
 * @extends BaseTask
 */

module.exports = BaseTask.extend({
    getTargets : function() {
        return this.room.find(FIND_CONSTRUCTION_SITES).map((target) => target.id);
    },

    doTask : function(creep, target) {
        creep.task.targetType = target.structureType;
        creep.task.targetPos = {
            x : target.pos.x,
            y : target.pos.y,
        };
        return creep.build(target);
    },

    targetIsInvalid : function(creep, target) {
        if (creep.task.targetType) {
            let newTarget = target || this.room.lookForAt(LOOK_STRUCTURES, creep.task.targetPos.x, creep.task.targetPos.y)[0];
            if (creep.task.targetType && TYPE_TO_EVENT[creep.task.targetType]) {
                this.room.fireEvents[TYPE_TO_EVENT[creep.task.targetType]] = this.room.fireEvents[TYPE_TO_EVENT[creep.task.targetType]] || [];
                this.room.fireEvents[TYPE_TO_EVENT[creep.task.targetType]].push(newTarget);
            }
        }
    },
}, {
    UPDATE_TARGET_EVENTS : [constants.CONSTRUCTION_SITE_ADDED],
    TASK_NAME : "build",
});
