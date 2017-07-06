let constants = require("constants");
let BaseTask = require("task.position");

/**
 * Task for defenders to shoot at enemy
 *
 * @module task
 * @class DefendShootTask
 * @extends PositionTask
 */

module.exports = PositionTask.extend({
    getTargets : function() {
        return ((this.room.defence.enemyArmy && this.room.defence.enemyArmy.targets) || []).splice();
    },

    doTask : function(creep, target) {
        return creep.rangedAttack(target);
    },

    isTargetValid : function(target) {
        return target.hits <= 0;
    },
}, {
    TASK_NAME : "defendShoot",
});
