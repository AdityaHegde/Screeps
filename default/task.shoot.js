var baseTask = require("task.base");

module.exports = _.merge({}, baseTask, {
    getTargets : function(room, taskInfo) {
        return (room.defence.enemyArmy && room.defence.enemyArmy.targets) || [];
    },

    doTask : function(creep, target) {
        return creep.rangedAttack(target);
    },

    isTargetValid : function(target) {
        return target.hits <= 0;
    },
});