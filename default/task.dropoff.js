let constants = require("constants");
let BaseTask = require("task.base");

/**
 * Task to drop off energy to spawn, extension or other structures that take energy (TODO)
 *
 * @module task
 * @class DropOffTask
 * @extends BaseTask
 */

let DropOffTask = BaseTask.extend({
    init : function() {
        this.potentialTargets = this.getPotentialTargets();
        this.updateTargets();
    },

    updatePotentialTargets : function(newPotentialTargets) {
        this.potentialTargets.push(...newPotentialTargets.map(newPotentialTarget => newPotentialTarget.id));
        this.updateTargets();
    },

    getPotentialTargets : function() {
        return this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN;
            },
        }).map((structure) => structure.id);
    },

    updateTargets : function() {
        this.targets = this.getTargets();
        this.hasTarget = this.targets.length > 0;
    },

    getTargets : function() {
        return this.potentialTargets.filter((potentialTarget) => {
            return this.isTargetValid(Game.getObjectById(potentialTarget));
        });
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
}, {
    UPDATE_TARGET_EVENTS : [constants.CREEP_CREATED],
    UPDATE_POTENTIAL_TARGETS_EVENTS : [constants.EXTENSION_BUILT],
    TASK_NAME : "dropoff",

    init : function(room) {
        BaseTask.init.call(this, room);
        this.UPDATE_POTENTIAL_TARGETS_EVENTS.forEach((eventListener) => {
            eventBus.subscribe(eventListener.eventName, this.prototype.updatePotentialTargets, "tasksInfo." + this.TASK_NAME);
        });
    },
});

module.exports = DropOffTask;
