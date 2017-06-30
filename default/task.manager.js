var TASKS = {
    "dropoff" : require("task.dropoff"),
    "upgrade" : require("task.upgrade"),
    "build" : require("task.build"),
    "harvest" : require("task.harvest"),
    "repair" : require("task.repair"),
};
var utils = require("utils");
var constants = require("constants");

utils.definePropertyInMemory(Room.prototype, "tasksInfo", function() {
    let tasksInfo = {};

    for (let taskName in TASKS) {
        tasksInfo[taskName] = {
            targets : [],
            hasTarget : false,
        };
        TASKS[taskName].init(this, tasksInfo[taskName]);
    });

    return tasksInfo;
});

Object.defineProperties(Room.prototype, {
    tickTaskManager : function() {
        for (let taskName in TASKS) {
            TASKS[taskName].tick(this, this.memory.tasksInfo[taskName]);
        }

        for (var workerName in this.memory.workers) {
            var worker = Game.creeps[workerName];

            if (worker) {
                if (worker.memory.task) {
                    var roleInfo = spawn.memory.rolesInfo[worker.memory.role.name];
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
});

Object.defineProperties(Creep.prototype, {
    executeTask : function(room) {
        if (worker.memory.task) {
            var roleInfo = spawn.memory.roleManager[worker.memory.role.name];
            var currentTask = roleInfo.tasks[worker.memory.task.current];
            var returnValue = TASKS[worker.memory.task.current].execute(spawn, worker, spawn.memory.taskManager.tasksInfo[worker.memory.task.current]);
            switch (returnValue) {
                case ERR_INVALID_TARGET:
                case ERR_NO_BODYPART:
                case ERR_RCL_NOT_ENOUGH:
                    room.reassignTask(worker);
                    break;

                case ERR_NOT_ENOUGH_RESOURCES:
                    room.switchTask(worker);
                    break;

                case OK:
                case ERR_BUSY:
                default:
                    break;
            }
            else if (returnValue != OK)
        }
        else {
            room.assignTask(worker);
        }
    },
});

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

    workerHasDied : function(spawn, workerMemory, workerName) {
    },
};

module.exports = taskManager;
