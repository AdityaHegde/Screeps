var _ = require("lodash");
var baseTask = require("task.base");

module.exports = _.merge({}, baseTask, {
    init : function(room, taskInfo) {
        taskInfo.energyCapacityAvailable = room.energyCapacityAvailable;
        taskInfo.potentialTargets = this.getPotentialTargets(room);
    },

    getPotentialTargets : function(room) {
        return room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER;
            },
        }).map((structure) => structure.id);
    },

    tick : function(room, taskInfo) {
        //targets for harvest drop might have changed
        if (taskInfo.energyCapacityAvailable < room.room.energyCapacityAvailable) {
            this.initroom(room, taskInfo);
        }

        taskInfo.targets = this.getTargets(room, taskInfo);
        taskInfo.hasTarget = taskInfo.targets.length > 0;
    },

    getTarget : function(spawn, taskInfo) {
        //TODO return a different target each time
        return Game.getObjectById(taskInfo.targets[0]);
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
        return creep.carry.energy < creep.carryCapacity;
    },

    isTargetValid : function(target) {
        return target.energy < target.energyCapacity;
    },
});
