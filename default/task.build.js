var constants = require("constants");
var baseTask = require("task.base");

var TYPE_TO_EVENT = {
    [STRUCTURE_CONTAINER] : constants.CONTAINER_BUILT,
    [STRUCTURE_EXTENSION] : constants.EXTENSION_BUILT,
    [STRUCTURE_WALL] : constants.WALL_BUILT,
    [STRUCTURE_TOWER] : constants.TOWER_BUILT,
};

var STRUCURE_TYPE_TO_PLANNER = {
    [STRUCTURE_CONTAINER] : "container",
};

/**
 * Task to drop off energy to spawn, extension or other structures that take energy (TODO)
 *
 * @module task
 * @Class BuildTask
 * @extends BaseTask
 */

module.exports = _.assign({}, baseTask, {
    TARGETS_EVENT : constants.CONSTRUCTION_SITE_ADDED,

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
                room.fireEvents[TYPE_TO_EVENT[creep.task.targetType]] = room.fireEvents[TYPE_TO_EVENT[creep.task.targetType]] || [];
                room.fireEvents[TYPE_TO_EVENT[creep.task.targetType]].push(newTarget.id);
            }
            room.fireEvents[constants.STRUCURE_BUILT] = room.fireEvents[constants.STRUCURE_BUILT] || [];
            room.fireEvents[constants.STRUCURE_BUILT].push(newTarget.id);

            if (STRUCURE_TYPE_TO_PLANNER[newTarget.structureType]) {
                var plannerInfo = room.basePlanner.plannerInfo[STRUCURE_TYPE_TO_PLANNER[newTarget.structureType]];
                if (plannerInfo && plannerInfo.labelMap && plannerInfo.labelMap[newTarget.pos.x + "__" + newTarget.pos.y]) {
                    newTarget.label = plannerInfo.labelMap[newTarget.pos.x + "__" + newTarget.pos.y];
                }
            }
        }
    },
});
