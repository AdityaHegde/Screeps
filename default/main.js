var workerManager = require("worker.manager");

module.exports.loop = function () {
    for (var spawnName in Game.spawns) {
        var spawn = Game.spawns[spawnName];
        if (!spawn.memory.isInitialized) {
            workerManager.initSpawn(spawn);
        }

        workerManager.tick(spawn);
    }
}
