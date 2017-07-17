let utils = require("utils");
let constants = require("constants");
let BaseTask = require("task.base");
let eventBus = require("event.bus");

/**
 * Task to drop off energy to spawn, extension or other structures that take energy (TODO)
 *
 * @module task
 * @class DropOffTask
 * @extends BaseTask
 */

let DropOffTask = BaseTask.extend({
    init : function(room) {
        this.room = room;
        this.potentialTargets = this.getPotentialTargets();
        this.updateTargetsMap();
    },

    updatePotentialTargets : function(newPotentialTargets) {
        this.potentialTargets.push(...newPotentialTargets.filter((structure) => {
            return this.potentialTargetsFilter(structure);
        }).map(newPotentialTarget => newPotentialTarget.id));
        this.potentialTargets = _.uniq(this.potentialTargets);
        this.updateTargetsMap();
    },

    getPotentialTargets : function() {
        return this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return this.potentialTargetsFilter(structure);
            },
        }).map((structure) => structure.id);
    },

    potentialTargetsFilter : function(structure) {
        return structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN;
    },

    getTargets : function() {
        return this.potentialTargets.filter((potentialTarget) => {
            return this.isTargetValid(Game.getObjectById(potentialTarget));
        });
    },

    targetsFilter : function(structure) {
        return this.potentialTargetsFilter(structure);
    },

    doTask : function(creep, target) {
        return creep.transfer(target, RESOURCE_ENERGY);
    },

    isTaskValid : function(creep, target) {
        return creep.carry.energy > 0;
    },

    isTargetValid : function(target) {
        return target.canStoreEnergy();
    },

    targetIsClaimed : function(creep, target) {
        BaseTask.prototype.targetIsClaimed.call(this, creep, target);
        this.targetsMap[target.id] += creep.carry.energy;
    },

    targetIsReleased : function(creep, target) {
        this.targetsMap[target.id] -= creep.carry.energy;
    },

    isAssignedTargetValid : function(target) {
        return (target.getRemainingEnergyCapacity() - this.targetsMap[target.id]) > 0;
    },
}, {
    UPDATE_TARGET_EVENTS : [constants.CREEP_CREATED],
    UPDATE_POTENTIAL_TARGETS_EVENTS : [constants.EXTENSION_BUILT],
    TASK_NAME : "dropoff",

    init : function(room) {
        BaseTask.init.call(this, room);
        this.UPDATE_POTENTIAL_TARGETS_EVENTS.forEach((eventListener) => {
            eventBus.subscribe(eventListener, "updatePotentialTargets", "tasksInfo." + this.TASK_NAME);
        });
    },
});

utils.definePropertyInMemory(DropOffTask, "potentialTargets");

module.exports = DropOffTask;
