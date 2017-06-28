let build = require("task.build");
let _ = require("lodash");

module.exports = _.merge({}, build, {
    initSpawn : function(spawn, taskInfo) {
        spawn.memory.sourceManager = {
            sources : [],
            sourceInfo : {},
            totalAvailableSpaces : 0,
            pointer : 0,
        };

        this.addSourcesFromRoom(spawn, spawn.room);
    },

    addSourcesFromRoom : function(spawn, room) {
        var sources = room.find(FIND_SOURCES);
        spawn.memory.sourceManager.sources.push.apply(spawn.memory.sourceManager.sources, sources.map(source => source.id));

        sources.forEach(function(source) {
            var availableSpaces = 0;
            //check for available spaces around the source
            for (var x = source.pos.x - 1; x <= source.pos.x + 1; x++) {
                for (var y = source.pos.y - 1; y <= source.pos.y + 1; y++) {
                    if (Game.map.getTerrainAt(x, y, room.name) != "wall") {
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
        var minDiff = 999, minSource, i = spawn.memory.sourceManager.pointer;

        do {
            var source = spawn.memory.sourceManager.sources[i];
            var sourceInfo = spawn.memory.sourceManager.sourceInfo[source];
            if (sourceInfo.occupiedSpaces < sourceInfo.availableSpaces) {
                spawn.memory.sourceManager.pointer = (spawn.memory.sourceManager.pointer + 1) % spawn.memory.sourceManager.sources.length;
                //if there is a free space, just return it
                return source;
            }
            else if (sourceInfo.occupiedSpaces - sourceInfo.availableSpaces < minDiff) {
                //else select the source with min overflow of workers
                minDiff = sourceInfo.occupiedSpaces - sourceInfo.availableSpaces;
                minSource = source;
            }

            i = (i + 1) % spawn.memory.sourceManager.sources.length;
        } while (i != spawn.memory.sourceManager.pointer && i < spawn.memory.sourceManager.sources.length);

        return minSource;
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

    getTarget : function(spawn, worker, taskInfo) {
        if (!worker.memory.assignedSource) {
            this.claimSource(spawn, worker, this.findSource(spawn));
        }
        return Game.getObjectById(worker.memory.assignedSource);
    },

    updateTargets : function(spawn, taskInfo) {
        //dummy
    },

    getTargets : function(spawn, taskInfo) {
        //dummy
    },

    doTask : function(worker, target) {
        return worker.harvest(target);
    },

    workerHasDied : function(spawn, workerMemory, workerName) {
        this.releaseSource(spawn, {
            memory : workerMemory,
            name : workerName,
        });
    },
});
