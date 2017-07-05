var baseTask = require("task.base");

module.exports = _.assign({}, baseTask, {
    tick : function(room, taskInfo) {
        if (room.defence.enemyArmy && roleInfo.targets.length == 0) {
            this.updateTargets(rome, taskInfo);
        }
    },

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
