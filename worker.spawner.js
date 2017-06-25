module.exports = {
    initSpawn : function(spawn) {
        spawn.memory.spawner = {
            workers : {},
            workerCount : 0,
        };
    },

    tick : function(spawn) {
        var spawner = spawn.memory.spawner;

        //check if worker count is less than twice the available space for source collecction
        //twice the spaces is just arbitrary, assuming that half will be collecting source and half will be working
        if (spawner.workerCount < spawn.memory.sourceManager.totalAvailableSpaces * 3 / 2) {
            var parts = spawn.memory.partsManager.parts.slice();
            if(spawn.canCreateCreep(parts, undefined) == OK) {
                var creepName = spawn.createCreep(parts, undefined, {role: "worker"});
                spawner.workers[creepName] = 1;
                spawner.workerCount++;
                console.log('Creating a worker : ' + creepName);
            }
        }
    },

    workerHasDied : function(spawn, creepMemory, name) {
        delete spawn.memory.spawner.workers[name];
        spawn.memory.spawner.workerCount--;
    },
};
