var TASKS = {
    "dropoff" : require("task.dropoff"),
    "upgrade" : require("task.upgrade"),
    "build" : require("task.build"),
    "harvest" : require("task.harvest"),
    "repair" : require("task.repair"),
};

var taskManager = {
    TASKS : TASKS,

    initSpawn : function(spawn) {
        spawn.memory.taskManager = {
            tasksInfo : {},
        };

        for (let taskName in TASKS) {
            spawn.memory.taskManager.tasksInfo[taskName] = {
                targets : [],
                hasTarget : false,
            };
            TASKS[taskName].initSpawn(spawn, spawn.memory.taskManager.tasksInfo[taskName]);
        });
    },

    tick : function(spawn) {
        spawn.memory.taskManager.validTasks = [];
        spawn.memory.taskManager.freeTasks = {};
        spawn.memory.taskManager.hasFreeTasks = false;

        TASKS.forEach(function(task) {
            var taskInfo = spawn.memory.taskManager.tasksInfo[task.name];
            task.api.tick(spawn, taskInfo);
        }.bind(this));

        for (var workerName in spawn.memory.spawner.workers) {
            var worker = Game.creeps[workerName];

            if (worker) {
                if (worker.memory.task) {
                    var roleInfo = spawn.memory.roleManager[worker.memory.role.name];
                    var currentTask = roleInfo.tasks[worker.memory.task.current];
                    var returnValue = TASKS[worker.memory.task.current].execute(spawn, worker, spawn.memory.taskManager.tasksInfo[worker.memory.task.current]);
                    switch (returnValue) {
                        case ERR_INVALID_TARGET:
                        case ERR_NO_BODYPART:
                        case ERR_RCL_NOT_ENOUGH:
                            roleManager.reassignTask(spawn, worker, roleInfo);
                            break;

                        case ERR_NOT_ENOUGH_RESOURCES:
                            roleManager.switchTask(spawn, worker, roleInfo);
                            break;

                        case OK:
                        case ERR_BUSY:
                        default:
                            break;
                    }
                    else if (returnValue != OK)
                }
                else {
                    roleManager.assignTask(spawn, worker, roleInfo);
                }
            }
        }
    },

    postTick : function(spawn) {
    },

    workerHasDied : function(spawn, workerMemory, workerName) {
    },
};

module.exports = taskManager;
