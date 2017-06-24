module.exports = {
    getWork : function(spawn) {
        return spawn.room.controller;
    },

    work : function(creep) {
        var target = Game.getObjectById(creep.memory.work.target);
        return creep.upgradeController(target);
    },
};
