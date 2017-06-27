var sourceManager = {
    initSpawn : function(spawn) {
        var sources = spawn.room.find(FIND_SOURCES);
        spawn.memory.sourceManager = {
            sources : sources.map(source => source.id),
            sourceInfo : {},
            totalAvailableSpaces : 0,
        };
        sources.forEach(function(source) {
            var availableSpaces = 0;
            //check for available spaces around the source
            for (var x = source.pos.x - 1; x <= source.pos.x + 1; x++) {
                for (var y = source.pos.y - 1; y <= source.pos.y + 1; y++) {
                    if (Game.map.getTerrainAt(x, y, source.room.name) != "wall") {
                        availableSpaces++;
                    }
                }
            }
            spawn.memory.sourceManager.sourceInfo[source.id] = {
                assigned : {},
                occupiedSpaces : 0,
                availableSpaces : availableSpaces,
            };
            spawn.memory.sourceManager.totalAvailableSpaces += availableSpaces;
        });
    },

    claimSource : function(spawn, worker, source) {
        var sourceInfo = spawn.memory.sourceManager.sourceInfo[source];
        worker.memory.assignedSource = source;
        sourceInfo.occupiedSpaces++;
        sourceInfo.assigned[worker.name] = 1;
        //console.log(worker.name, "Claimed source", worker.memory.assignedSource, "(", sourceInfo.occupiedSpaces, "/", sourceInfo.availableSpaces, ")");
    },

    //Return a source with a free space around it.
    //If no souce is found, return the source with least workers waiting
    findSource : function(spawn) {
        var minDiff = 999, minSource;
        for (var i = 0; i < spawn.memory.sourceManager.sources.length; i++) {
            var source = spawn.memory.sourceManager.sources[i];
            var sourceInfo = spawn.memory.sourceManager.sourceInfo[source];
            if (sourceInfo.occupiedSpaces < sourceInfo.availableSpaces) {
                //if there is a free space, just return it
                return source;
            }
            else if (sourceInfo.occupiedSpaces - sourceInfo.availableSpaces < minDiff) {
                //else select the source with min overflow of workers
                minDiff = sourceInfo.occupiedSpaces - sourceInfo.availableSpaces;
                minSource = source;
            }
        }

        return minSource;
    },

    moveToSource : function(spawn, worker) {
        if (!worker.memory.assignedSource) {
            sourceManager.claimSource(spawn, worker, sourceManager.findSource(spawn));
        }
        var source = Game.getObjectById(worker.memory.assignedSource);
        if(worker.harvest(source) == ERR_NOT_IN_RANGE) {
            worker.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    },

    releaseSource : function(spawn, worker) {
        if (worker.memory.assignedSource) {
            //console.log(worker.name, "Released source", worker.memory.assignedSource);
            var sourceInfo = spawn.memory.sourceManager.sourceInfo[worker.memory.assignedSource];
            sourceInfo.occupiedSpaces--;
            delete sourceInfo.assigned[worker.name];
            delete worker.memory.assignedSource;
        }
    },

    workerHasDied : function(spawn, workerMemory, workerName) {
        sourceManager.releaseSource(spawn, {
            memory : workerMemory,
            name : workerName,
        });
    },
};

module.exports = sourceManager;
