var _ = require("lodash");
var taskBuild = require("task.build");

module.exports = _.merge({}, taskBuild, {
    initSpawn : function(spawn, taskInfo) {
        taskInfo.energyCapacityAvailable = spawn.room.energyCapacityAvailable;
        taskInfo.potentialTargets = this.getPotentialTargets(spawn);
    },

    getPotentialTargets : function(spawn) {
        return spawn.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN;
            },
        }).map((structure) => structure.id);
    },

    tick : function(spawn, taskInfo) {
        //targets for harvest drop might have changed
        if (taskInfo.energyCapacityAvailable < spawn.room.energyCapacityAvailable) {
            this.initSpawn(spawn, taskInfo);
        }

        taskInfo.targets = this.getTargets(spawn, taskInfo);
    },

    getTarget : function(spaw, taskInfo) {
        //TODO return a different target each time
        return Game.getObjectById(taskInfo.targets[0]);
    },

    getTargets : function(spawn, taskInfo) {
        return taskInfo.potentialTargets.filter(function(potentialTarget) {
            return this.isTargetValid(Game.getObjectById(potentialTarget));
        }.bind(this));
    },

    doTask : function(worker, target) {
        return worker.transfer(target, RESOURCE_ENERGY);
    },

    isTargetValid : function(target) {
        return target.energy < target.energyCapacity;
    },
});
