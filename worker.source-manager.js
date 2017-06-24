module.exports = {
    initSpawn : function(spawn) {
        this.spawn = spawn;
        spawn.memory.sourceManager = {
            sources : spawn.room.find(FIND_SOURCES).map(source => source.id),
            sourceAssingments : {},
            sourceIndex : 0,
        };
        spawn.memory.sourceManager.sources.forEach(function(source) {
            spawn.memory.sourceManager.sourceAssingments[source.id] = {
                assigned : {},
                count : 0,
            };
        });
    },

    getSource : function(spawn, creep) {
        var sourceManager = spawn.memory.sourceManager;
        var source = sourceManager.sources[sourceManager.sourceIndex];
        var sourceAssingment = sourceManager.sourceAssingments[source];
        sourceAssingment.assigned[creep.name] = 1;
        creep.memory.assignedSource = source;
        creep.memory.assignedSourceIdx = sourceManager.sourceIndex;
        sourceManager.sourceIndex++;
        if (sourceManager.sourceIndex == sourceManager.sources.length) {
            sourceManager.sourceIndex = 0;
        }
        return source;
    },

    moveToSource : function(spawn, creep) {
        var source = Game.getObjectById(creep.memory.assignedSource);
        if(creep.harvest(source[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source[0], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    },

    creepHasDied : function(spawn, creepMemory, creepName) {
        var sourceManager = spawn.memory.sourceManager;
        var source = creepMemory.assignedSource;
        if (source) {
            var sourceAssingment = sourceManager.sourceAssingments[source];
            delete sourceAssingment.assigned[creepName];
            sourceManager.sourceIndex = creepMemory.assignedSourceIdx || 0;
        }
    },
};
