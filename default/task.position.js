var baseTask = require("task.base");

module.exports = _.merge({}, baseTask, {
    getTargets : function(room, taskInfo) {
        if (room.defence.enemyArmy) {
            return room.lookForAtArea(LOOK_STRUCTURES, room.defence.enemyArmy.area.top, room.defence.enemyArmy.area.left,
                                      room.defence.enemyArmy.area.bottom, room.defence.enemyArmy.area.right, true)
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
});
