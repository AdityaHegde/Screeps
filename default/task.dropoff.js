var constants = require("constants");
var baseTask = require("task.base");

/**
 * Task to drop off energy to spawn, extension or other structures that take energy (TODO)
 *
 * @module task
 * @Class DropOff
 * @extends BaseTask
 */

module.exports = _.merge({}, baseTask, {
    init : function(room, taskInfo) {
        taskInfo.energyCapacityAvailable = room.energyCapacityAvailable;
        taskInfo.potentialTargets = this.getPotentialTargets(room);
        this.updateTargets(room, taskInfo);
    },

    tick : function(room, taskInfo) {
        //targets for harvest drop might have changed
        if (taskInfo.energyCapacityAvailable < room.energyCapacityAvailable) {
            this.init(room, taskInfo);
        }
        if (room.listenEvents[constants.CREEP_CREATED]) {
            this.updateTargets(room, taskInfo);
        }
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
