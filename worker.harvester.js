module.exports = {
    getWork : function(spawn) {
        var targets = spawn.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                        structure.energy < structure.energyCapacity;
                }
        });
        return targets[0];
    },

    work : function(creep) {
        var target = Game.getObjectById(creep.memory.work.target);
        return creep.transfer(target, RESOURCE_ENERGY);
    },
};
