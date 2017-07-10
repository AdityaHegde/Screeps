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

    taskExecuted : function(creep, target) {
        this.targetsMap[target.id] -= (creep.task.lastEnergy - creep.carry.energy);
        creep.task.lastEnergy = creep.carry.energy;
        //console.log(this.constructor.TASK_NAME, "targetIsUpdated", target.id, this.targetsMap[target.id]);
    },

    targetIsInvalid : function(creep, target) {
        if (creep.task.targetType) {
            let newTarget = target || this.room.lookForAt(LOOK_STRUCTURES, creep.task.targetPos.x, creep.task.targetPos.y)[0];
            if (newTarget && creep.task.targetType && TYPE_TO_EVENT[creep.task.targetType]) {
                this.room.fireEvent(TYPE_TO_EVENT[creep.task.targetType], newTarget);
            }
        }
    },

    taskStarted : function(creep) {
        BaseTask.prototype.taskStarted.call(this, creep);
        var source = Game.getObjectById(creep.task.source);
        if (source) {
            var dir = ((creep.pos.getDirectionTo(source.pos) + 3) % 8) + 1;
            creep.move(dir);
        }
    },

    isTaskValid : function(creep, target) {
        return creep.carry.energy > 0;
    },

    targetIsClaimed : function(creep, target) {
        creep.task.lastEnergy = creep.carry.energy;
        this.targetsMap[target.id] += creep.carry.energy;
        //console.log(this.constructor.TASK_NAME, "targetIsClaimed", target.id, this.targetsMap[target.id]);
    },

    targetIsReleased : function(creep, target) {
        this.targetsMap[target.id] -= (creep.task.lastEnergy - creep.carry.energy);
        delete creep.task.lastEnergy;
        //console.log(this.constructor.TASK_NAME, "targetIsReleased", target.id, this.targetsMap[target.id]);
    },

    isAssignedTargetValid : function(target) {
        //console.log(target.id, target.progressTotal, target.progress, this.targetsMap[target.id], target.progressTotal - target.progress - this.targetsMap[target.id]);
        return (target.progressTotal - target.progress - this.targetsMap[target.id]) > 0;
    },
}, {
    UPDATE_TARGET_EVENTS : [constants.CONSTRUCTION_SITE_ADDED],
    TASK_NAME : "build",
});
