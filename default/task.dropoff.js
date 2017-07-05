var constants = require("constants");
var baseTask = require("task.base");

/**
 * Task to drop off energy to spawn, extension or other structures that take energy (TODO)
 *
 * @module task
 * @Class DropOff
 * @extends BaseTask
 */

module.exports = _.assign({}, baseTask, {
    POTENTIAL_TARGETS_EVENT : constants.EXTENSION_BUILT,
    TARGETS_EVENT : constants.CREEP_CREATED,

    init : function(room, taskInfo) {
        taskInfo.potentialTargets = this.getPotentialTargets(room);
        this.updateTargets(room, taskInfo);
    },

    tick : function(room, taskInfo) {
        //targets for harvest drop might have changed
        if (room.listenEvents[this.POTENTIAL_TARGETS_EVENT]) {
            this.updatePotentialTargets(room, taskInfo);
        }
        if (room.listenEvents[this.TARGETS_EVENT]) {
            this.updateTargets(room, taskInfo);
        }
    },

    updatePotentialTargets : function(room, taskInfo) {
        taskInfo.potentialTargets.push(...room.listenEvents[this.POTENTIAL_TARGETS_EVENT]);
        taskInfo.potentialTargets = _.uniq(taskInfo.potentialTargets);
        this.updateTargets(room, taskInfo);
    },

    getPotentialTargets : function(room) {
        return room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN;
            },
        }).map((structure) => structure.id);
    },

    updateTargets : function(room, taskInfo) {
        taskInfo.targets = this.getTargets(room, taskInfo);
        taskInfo.hasTarget = taskInfo.targets.length > 0;
    },

    getTargets : function(room, taskInfo) {
        return taskInfo.potentialTargets.filter(function(potentialTarget) {
            return this.isTargetValid(Game.getObjectById(potentialTarget));
        }.bind(this));
    },

    doTask : function(creep, target) {
        return creep.transfer(target, RESOURCE_ENERGY);
    },

    isTaskValid : function(creep, target) {
        return creep.carry.energy > 0;
    },

    isTargetValid : function(target) {
        return target.energy < target.energyCapacity;
    },
});
