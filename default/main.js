var workerManager = require("worker.manager");
var basePlanner = require("base.planner");

module.exports.loop = function () {
    for (var spawnName in Game.spawns) {
        var spawn = Game.spawns[spawnName];
        if (!spawn.memory.isInitialized) {
            basePlanner.initSpawn(spawn);
            workerManager.initSpawn(spawn);

            console.log(Game.cpu.getUsed(), "cpu used during init of spawn", spawnName);
        }

        basePlanner.tick(spawn);
        workerManager.tick(spawn);
    }
}
