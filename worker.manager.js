var MAX_WORKERS = 9;

var spawner = require("worker.spawner");
var sourceManager = require("worker.source-manager");
var partsManager = require("worker.parts-manager");
var taskManager = require("task.manager");

var workerManager = {
    initSpawn : function(spawn) {
        spawner.initSpawn(spawn);
        sourceManager.initSpawn(spawn);
        partsManager.initSpawn(spawn);
        taskManager.initSpawn(spawn);

        spawn.memory.isInitialized = true;
    },

    tick : function(spawn) {
        taskManager.tick(spawn);

        for (var workerName in spawn.memory.spawner.workers) {
            var worker = Game.creeps[workerName];

            if (Memory.creeps[workerName] && !Game.creeps[workerName]) {
                workerManager.workerHasDied(spawn, Memory.creeps[workerName], workerName)
                delete Memory.creeps[workerName];
            }
            else if (!worker) {
                spawner.workerHasDied(spawn, {}, workerName);
            }
            else {
                taskManager.doTask(spawn, worker);
            }
        }

        partsManager.tick(spawn);
        spawner.tick(spawn);

        taskManager.postTick(spawn);
    },

    workerHasDied : function(spawn, creepMemory, name) {
        if (creepMemory.work) {
            spawn.memory.workerManager.workCounts[creepMemory.work.name]--;
        }
        spawner.workerHasDied(spawn, creepMemory, name);
        sourceManager.workerHasDied(spawn, creepMemory, name);
        taskManager.workerHasDied(spawn, creepMemory, name);
    },
};

module.exports = workerManager;
