let constants = require("constants");
let BaseTask = require("task.base");

/**
 * Task to position defenders onto ramparts
 *
 * @module task
 * @class PositionTask
 * @extends BaseTask
 */

module.exports = BaseTask.extend({
    getTargets : function() {
        if (this.room.defence.enemyArmy) {
            return this.room.lookForAtArea(LOOK_STRUCTURES, this.room.defence.enemyArmy.area.top, this.room.defence.enemyArmy.area.left,
                                      this.room.defence.enemyArmy.area.bottom, this.room.defence.enemyArmy.area.right, true)
                   .filter(structure => structure.structureType == STRUCTURE_RAMPART)
                   . map(structure => structure.id);
        }
        return [];
    },

    doTask : function(creep, target) {
        return ERR_NOT_IN_RANGE;
    },

    isTaskValid : function(creep, target) {
        nearestRampart = creep.task.nearestRampart && Game.getObjectById(creep.task.nearestRampart);
        return !nearestRampart || (creep.pos.x == nearestRampart.pos.x && creep.pos.y == nearestRampart.pos.y);
    },
}, {
    UPDATE_TARGET_EVENTS : [constants.ENEMY_AT_THE_GATE],
    TASK_NAME : "position",
});
