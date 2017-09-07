let BaseTask = require("task.base");

/**
 * Task for defenders to shoot at enemy
 *
 * @module task
 * @class DefendShootTask
 * @extends BaseTask
 */

module.exports = BaseTask.extend({
    getTargets: function () {
        return this.room.enemyArmy.enemyCreeps;
    },

    doTask: function (creep, target) {
        return creep.rangedAttack(target);
    },

    isTargetValid: function (target) {
        return target.hits <= 0;
    },

    targetIsClaimed : function (creep, target) {
        this.targetsMap[target.id]++;
    },

    

    getTargetForMovement : function (creep, target) {

    }
}, {
    TASK_NAME: "defendShoot"
});
