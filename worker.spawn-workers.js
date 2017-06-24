var MAX_WORKERS = 9;

var spawnWorkers = {
    initSpawn : function(spawn) {
        spawn.memory.spawner = {
            workers : {},
            workerCount : 0,
        };
    },

    tick : function(spawn) {
        var spawner = spawn.memory.spawner;

        if (spawner.workerCount.length < MAX_WORKERS) {
            var parts = spawn.memory.partManager.parts.slice();
            if(spawn.canCreateCreep(parts, undefined) == OK) {
                var creepName = spawn.createCreep(parts, undefined, {role: "worker"});
                if (creepName > 0) {
                    spawner.workers[creepName] = 1;
                    spawner.workerCount++;
                    console.log('Creating a worker : ' + creepName);
                }
            }
        }
    },

    workerHasDied : function(spawn, creepMemory, name) {
        delete spawn.memory.spawner.workers[name];
        spawn.memory.spawner.workerCount--;
    },
};

module.exports = spawnWorkers;
