var workerManager = require("worker.worker-manager");

module.exports.loop = function () {
    for (var spawn in Game.spawns) {
        if (!spawn.memory.isInitialized) {
            workerManager.initSpawn(spawn);
        }

        workerManager.tick(spawn);
    }
}
