/* globals Game, STRUCTURE_CONTAINER, STRUCTURE_EXTENSION, STRUCTURE_WALL, STRUCTURE_TOWER, FIND_CONSTRUCTION_SITES, LOOK_STRUCTURES */

let constants = require("constants");
let math = require("math");
let BaseTask = require("task.base");

/**
 * Task to drop off energy to spawn, extension or other structures that take energy (TODO)
 *
 * @module task
 * @class BuildTask
 * @extends BaseTask
 */

module.exports = BaseTask.extend({
    getTargets: function () {
        return this.room.find(FIND_CONSTRUCTION_SITES).map((target) => target.id);
    },

    doTask: function (creep, target) {
        creep.task.targetType = target.structureType;
        creep.task.targetPos = {
            x: target.pos.x,
            y: target.pos.y
        };
        return creep.build(target);
    },

    targetIsInvalid: function (creep, target) {
        let newTarget = target || this.room.lookForAt(LOOK_STRUCTURES, creep.task.targetPos.x, creep.task.targetPos.y)[0];
        if (newTarget && creep.task.targetType) {
            this.room.fireEvent(constants.STRUCURE_BUILT, newTarget);
        }
    },

    taskStarted: function (creep) {
        BaseTask.prototype.taskStarted.call(this, creep);
        var source = Game.getObjectById(creep.task.source);
        if (source) {
            var dir = math.rotateDirection(math.getDirectionBetweenPos(creep.pos, source.pos), 4);
            creep.move(dir);
        }
    },

    isTaskValid: function (creep, target) {
        return creep.carry.energy > 0;
    },

    targetIsClaimed: function (creep, target) {
        // TODO consider boosted parts
        BaseTask.prototype.targetIsClaimed.call(this, creep, target);
        this.targetsMap[target.id] += creep.carry.energy;
    },

    targetIsReleased: function (creep, target) {
        // TODO consider boosted parts
        this.targetsMap[target.id] -= creep.carry.energy;
    },

    isAssignedTargetValid: function (target) {
        return target && (target.progressTotal - this.targetsMap[target.id]) > 0;
    },
}, {
    UPDATE_TARGET_EVENTS: [constants.CONSTRUCTION_SITE_ADDED],
    TASK_NAME: "build"
});
