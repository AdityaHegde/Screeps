module.exports = {
    getWork : function(spawn) {
        var targets = spawn.room.find(FIND_CONSTRUCTION_SITES);
        return targets[0];
    },

    work : function(creep) {
        var target = Game.getObjectById(creep.memory.work.target);
        return creep.build(target);
    },
};
