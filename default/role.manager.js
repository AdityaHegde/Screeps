var ROLES = {
    "worker" : {
        tasks : [
            ["harvest"],
            ["dropoff", "build", "upgrade", "repair"],
        ],
    },
};

var taskManager = {
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

    taskIsNotFull : function(spawn, taskInfo, offset) {
        offset = offset || 0;
        return taskInfo.workerCount < Math.round((spawn.memory.spawner.workerCount - offset) / spawn.memory.taskManager.validTasks.length);
    },

    tick : function(spawn) {
        spawn.memory.taskManager.validTasks = [];
        spawn.memory.taskManager.freeTasks = {};
        spawn.memory.taskManager.hasFreeTasks = false;

        TASKS.forEach(function(task) {
            var taskInfo = spawn.memory.taskManager.tasksInfo[task.name];

            task.api.tick(spawn, taskInfo);

            taskInfo.hasTarget = taskInfo.targets.length > 0;
            if (taskInfo.hasTarget) {
                spawn.memory.taskManager.validTasks.push(task.name);
            }
        }.bind(this));

        spawn.memory.taskManager.validTasks.forEach(function(taskName) {
            var taskInfo = spawn.memory.taskManager.tasksInfo[taskName];

            if (taskInfo.hasTarget && this.taskIsNotFull(spawn, taskInfo)) {
                spawn.memory.taskManager.freeTasks[taskName] = 1;
                spawn.memory.taskManager.hasFreeTasks = true;
            }
        }.bind(this));

        for (var workerName in spawn.memory.spawner.workers) {
            var worker = Game.creeps[workerName];

            if (worker) {
                if (worker.memory.task) {

                }
            }
        }
    },

    postTick : function(spawn) {
        //post tick cleanup, used to remove temp data from memory
        delete spawn.memory.taskManager.freeTasks;
        delete spawn.memory.taskManager.hasFreeTasks;
        delete spawn.memory.taskManager.validTasks;
    },

    doTask : function(spawn, worker) {
        if (worker.memory.task) {
            //if the assigned task has no valid target anymore, reassign
            if (!spawn.memory.taskManager.tasksInfo[worker.memory.task.name].hasTarget) {
                this.reassignTask(spawn, worker);
            }
            //if worker is dry move it to energy source
            //or if the worker is gathering and is not full at energy yet
            if (worker.carry.energy == 0 ||
                (worker.memory.task.gathering && worker.carry.energy < worker.carryCapacity)) {
                worker.memory.task.gathering = true;
                sourceManager.moveToSource(spawn, worker);
            }
            //if the worker is not gethering, keep at the task
            //or if the worker has reached its capacity
            else if (!worker.memory.task.gathering || worker.carry.energy == worker.carryCapacity) {
                //if coming back from energy gathering, check if there are any tasks with free slots
                if (worker.carry.energy == worker.carryCapacity && spawn.memory.taskManager.hasFreeTasks &&
                    !spawn.memory.taskManager.freeTasks[worker.memory.task.name] &&
                    this.taskIsNotFull(spawn, spawn.memory.taskManager.tasksInfo[worker.memory.task.name], 1)) {
                    this.reassignTask(spawn, worker);
                }

                //sourceManager.releaseSource(spawn, worker);
                worker.memory.task.gathering = false;
                TASKS[TASK_NAME_TO_IDX[worker.memory.task.name]].api.execute(spawn, worker, spawn.memory.taskManager.tasksInfo[worker.memory.task.name]);
            }
        }
        else {
            //if worker has no work and is full, assign work
            if (worker.carry.energy == worker.carryCapacity) {
                taskManager.assignTask(spawn, worker);
                if (worker.memory.task) {
                    console.log("Assigned", worker.name, "to", worker.memory.task.name, "(", spawn.memory.taskManager.tasksInfo[worker.memory.task.name].workerCount, ")");
                }
            }
            //else move it to source to max out capacity
            else {
                sourceManager.moveToSource(spawn, worker);
            }
        }
    },

    assignTask : function(spawn, worker, oldTask) {
        var i = 0;
        for (var i = 0; i < spawn.memory.taskManager.validTasks.length; i++) {
            var validTask = spawn.memory.taskManager.validTasks[i];
            var taskInfo = spawn.memory.taskManager.tasksInfo[validTask];

            if (validTask != oldTask && this.taskIsNotFull(spawn, taskInfo)) {
                worker.memory.task = {
                    name : validTask,
                };
                taskInfo.workers[worker.name] = 1;
                taskInfo.workerCount++;
                if (!this.taskIsNotFull(spawn, taskInfo)) {
                    delete spawn.memory.taskManager.freeTasks[validTask];
                }
                break;
            }
        }

        spawn.memory.taskManager.hasFreeTasks = Object.keys(spawn.memory.taskManager.freeTasks).length > 0;
    },

    clearTask : function(spawn, worker) {
        if (worker.memory.task) {
            var taskInfo = spawn.memory.taskManager.tasksInfo[worker.memory.task.name];
            delete taskInfo.workers[worker.name];
            taskInfo.workerCount--;

            if (this.taskIsNotFull(spawn, taskInfo)) {
                spawn.memory.taskManager.freeTasks[worker.memory.task.name] = 1;
                spawn.memory.taskManager.hasFreeTasks = Object.keys(spawn.memory.taskManager.freeTasks).length > 0;
            }

            delete worker.memory.task;
        }
    },

    reassignTask : function(spawn, worker) {
        var oldTask = worker.memory.task.name;
        taskManager.clearTask(spawn, worker);
        taskManager.assignTask(spawn, worker, oldTask);

        //no task was found to reassign
        if (!worker.memory.task) {
            return;
        }
        else {
            console.log("Reassigning", worker.name, "from", oldTask, "to", worker.memory.task.name, "(", spawn.memory.taskManager.tasksInfo[worker.memory.task.name].workerCount, ")");
        }
    },

    workerHasDied : function(spawn, workerMemory, workerName) {
        taskManager.clearTask(spawn, {
            memory : workerMemory,
            name : workerName,
        });
    },
};

module.exports = taskManager;
