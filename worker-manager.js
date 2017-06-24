var WORKS = [{
    work : "harvester",
    api : require("./harvester"),
}, {
    work : "upgrader",
    api : require("./upgrader"),
}, {
    work : "builder",
    api : require("./builder"),
}],
WORK_NAME_TO_IDX = {
    "harvester" : 0,
    "upgrader" : 1,
    "builder" : 2,
};
MAX_WORKERS = 9;

var spawnWorkers = require("worker.spawn-workers");
var sourceManager = require("worker.source-manager");
var partsManager = require("worker.parts-manager");

var workerManager = {
    initSpawn : function(spawn) {
        spawn.memory.workerManager = {
            workCounts : {},
        };
        WORKS.forEach(function(work) {
            spawn.memory.workerManager.workCounts[work.work] = 0;
        });

        spawnWorkers.initSpawn(spawn);
        sourceManager.initSpawn(spawn);
        partsManager.initSpawn(spawn);

        spawn.memory.isInitialized = true;
    },

    tick : function(spawn) {
        var workTargets = [], workIdx = 0;
        WORKS.forEach(function(work, idx) {
            var workTarget = work.api.getWork(spawn);
            if (workTarget) {
                workTargets.push({
                    work : work,
                    idx : idx,
                    target : workTarget,
                });
            }
        });

        for (var workerName in spawn.memory.spawner.workers) {
            var worker = Game.creeps[workerName];

            if (Memory.creeps[workerName] && !Game.creeps[workerName]) {
                workerManager.workerHasDied(spawn, Memory.creeps[workerName], workerName)
                delete Memory.creeps[workerName];
            }
            else {
                if (!worker.memory.assignedSource) {
                    sourceManager.getSource(spawn, creep);
                }

                if (worker.memory.work) {
                    //if worker is dry move it to energy source
                    if (worker.carry.energy == 0) {
                        sourceManager.moveToSource(spawn, creep);
                    }
                    //else if the assigned work is now invalid, assign new work
                    //TODO
                    /*else if() {
                        spawnerAPI.clearWork(spawn, worker);
                        spawnerAPI.assignWork(spawn, creep, workTargets, workIdx);
                    }*/
                }
                else {
                    //if worker has no work and is full, assign work
                    if (worker.carry.energy == worker.carryCapacity) {
                        workerManager.assignWork(spawn, creep, workTargets, workIdx);
                    }
                    //else move it to source to max out capacity
                    else {
                        sourceManager.moveToSource(spawn, creep);
                        workerManager.clearWork(spawn, worker);
                    }
                }
            }
        }

        partManager.tick(spawn);
        spawnWorkers.tick(spawn);
    },

    assignWork : function(spawn, worker, workTargets, workIdx) {
        for (; workIdx < workTargets.length; workIdx++) {
            if (spawn.memory.workerManager.workCounts[workTargets[workIdx].work] < spawn.memory.spawner.workerCount / workTargets.length) {
                worker.memory.work = {
                    name : workTargets[workIdx].work,
                    target : workTargets[workIdx].target,
                };
                break;
            }
        }
        if (worker.memory.work) {
            WORKS[WORK_NAME_TO_IDX[worker.memory.work.name]].api.work(spawn, creep);
        }
        else {
            //TODO move to a idle area
        }
    },

    clearWork : function(spawn, worker) {
        if (worker.memory.work) {
            spawn.memory.workerManager.workCounts[worker.memory.work.name]--;
            delete worker.memory.work;
        }
    },

    workerHasDied : function(spawn, creepMemory, name) {
        spawnWorkers.workerHasDied(spawn, creepMemory, name);
        sourceManager.creepHasDied(spawn, creepMemory, name);
    },
};

module.exports = workerManager;
