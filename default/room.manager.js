var constants = require("constants");
var utils = require("utils");
var ROLES = require("role.list");
var TASKS = require("task.list");
var BUILD_TYPES = require("build.list").types;
var BUILD_INIT_ORDER = require("build.list").initOrder;
let sourceManager = require("source.manager");
let creepManager = require("creep.manager");

utils.definePropertyInMemory(Room.prototype, "spawns", function() {
    return [];
});

utils.definePropertyInMemory(Room.prototype, "fireEvents", function() {
    return {};
});

utils.definePropertyInMemory(Room.prototype, "listenEvents", function() {
    return {};
});

utils.definePropertyInMemory(Room.prototype, "rolesInfo", function() {
    var rolesInfo = {};
    for (let role in ROLES) {
        rolesInfo[role] = {
            tasks : [],
            validTasksCount : {},
            freeTasks : {},
            hasFreeTasks : {},
            creepsCount : 0,
        };
        ROLES[role].init(this, rolesInfo[role]);
    }
    return rolesInfo;
});

utils.definePropertyInMemory(Room.prototype, "tasksInfo", function() {
    let tasksInfo = {};
    for (let taskName in TASKS) {
        tasksInfo[taskName] = {
            targets : [],
            hasTarget : false,
            creeps : {},
            creepsCount : 0,
        };
        TASKS[taskName].init(this, tasksInfo[taskName]);
    }
    return tasksInfo;
});

utils.definePropertyInMemory(Room.prototype, "spawns", function() {
    return this.find(FIND_MY_SPAWNS).map((spawn) => spawn.name);
});

utils.definePropertyInMemory(Room.prototype, "creeps", function() {
    return {};
});

utils.definePropertyInMemory(Room.prototype, "basePlanner", function() {
    var basePlanner = {
        lastLevel : this.controller.level,
        cursor : BUILD_TYPES.length,
        plannerInfo : {},
    };
    BUILD_INIT_ORDER.forEach(function(buildTypeIdx) {
        let buildType = BUILD_TYPES[buildTypeIdx];
        basePlanner.plannerInfo[buildType.name] = buildType.api.init(this);
    }.bind(this));
    return basePlanner;
});

Room.prototype.init = function() {
    this.spawns;
    this.tasksInfo;
    this.rolesInfo;
    this.basePlanner;
    this.addSources();
};

Room.prototype.tick = function() {
    if (this.spawns.length === 0 || this.listenEvents[constants.SPAWN_CREATED]) {
        this.spawns = this.find(FIND_MY_SPAWNS).map(spawn => spawn.id);
    }

    this.listenEvents = this.fireEvents;
    this.fireEvents = {};

    for (let roleName in ROLES) {
        var roleInfo = this.rolesInfo[roleName];
        ROLES[roleName].tick(this, this.rolesInfo[roleName]);

        if (roleInfo.creepsCount < ROLES[roleName].getMaxCount(this, roleInfo)) {
            let parts = roleInfo.parts.slice();
            //TODO select a free spawn
            let spawn = Game.spawns[this.spawns[0]];
            if(spawn.canCreateCreep(parts, undefined) == OK) {
                var creepName = spawn.createCreep(parts, undefined, {role: { name : roleName }});
                this.creeps[creepName] = 1;
                roleInfo.creepsCount++;
                console.log("Creating a", roleName, ":", creepName);
            }
        }

        roleInfo.tasks.forEach((taskTiers, i) => {
            roleInfo.freeTasks[i] = {};
            roleInfo.hasFreeTasks[i] = false;
            roleInfo.validTasksCount[i] = 0;

            taskTiers.forEach((taskName) => {
                var taskInfo = this.tasksInfo[taskName];
                TASKS[taskName].tick(this, taskInfo);
                roleInfo.validTasksCount[i] += taskInfo.hasTarget ? 1 : 0;
                if (this.isTaskFree(taskInfo, roleInfo, i)) {
                    roleInfo.hasFreeTasks[i] = true;
                    roleInfo.freeTasks[i][taskName] = 1;
                }
            });
        });
    }

    for (let creepName in this.creeps) {
        let creep = Game.creeps[creepName];

        if (creep) {
            creep.executeTask(this);
        }
        else if (Memory.creeps[creepName]) {
            console.log("Creep", creepName, "died");
            Memory.creeps[creepName].name = creepName;
            this.creepHasDied(Memory.creeps[creepName]);
            delete Memory.creeps[creepName];
        }
    }

    //check if RCL changed or some structures are yet to be built for current RCL
    //or there are some structures are being built
    if (!this.tasksInfo["build"].hasTarget && this.controller.level > this.basePlanner.lastLevel || this.basePlanner.cursor < BUILD_TYPES.length) {
        //reset the cursor when executed for the 1st time RCL changed
        if (this.basePlanner.cursor == BUILD_TYPES.length) {
            this.basePlanner.cursor = 0;
        }

        for (; this.basePlanner.cursor < BUILD_TYPES.length; this.basePlanner.cursor++) {
            //if the structure is yet to be finished, break
            if (!BUILD_TYPES[this.basePlanner.cursor].api.build(this,
                   this.basePlanner.plannerInfo[BUILD_TYPES[this.basePlanner.cursor].name])) {
                break;
            }
        }

        if (this.basePlanner.cursor == BUILD_TYPES.length) {
            //proceed only if all structures for this level are built
            this.basePlanner.lastLevel = this.controller.level;
        }
    }
};

Room.prototype.isTaskFree = function(taskInfo, roleInfo, tier, offset) {
    offset = offset || 0;
    //console.log(taskInfo.hasTarget, taskInfo.creepsCount, Math.round(roleInfo.creepsCount, roleInfo.validTasksCount[tier]));
    return taskInfo.hasTarget && taskInfo.creepsCount < Math.round(roleInfo.creepsCount / roleInfo.validTasksCount[tier]);
};

Room.prototype.assignTask = function(creep, roleInfo, taskInfo, taskIdx) {
    creep.task = creep.task || {
        tier : 0,
        tasks : {},
    };
    creep.task.current = taskIdx;
    creep.task.tasks[creep.task.tier] = taskIdx;
    taskInfo.creeps[creep.name] = 1;
    taskInfo.creepsCount++;
    assigned = true;

    var taskName = roleInfo.tasks[creep.task.tier][taskIdx];
    //clear the task as free if it is not free anymore
    if (roleInfo.freeTasks[creep.task.tier][taskName] && !this.isTaskFree(taskInfo, roleInfo, creep.task.tier)) {
        delete roleInfo.freeTasks[creep.task.tier][taskName];
        roleInfo.hasFreeTasks[creep.task.tier] = Object.keys(roleInfo.freeTasks[creep.task.tier]).length > 0;
    }

    console.log("Assigning", creep.name, "to", taskName);
}

Room.prototype.assignNewTask = function(creep, isNew) {
    let roleInfo = this.rolesInfo[creep.role.name];
    let tier = (isNew ? 0 : creep.task.tier);
    let tasks = roleInfo.tasks[tier];
    let lastCurrent = isNew || creep.task.current == undefined ? 0 : ((creep.task.current + 1) % tasks.length);
    let i = lastCurrent;
    let assigned = false, backup = null;

    if (roleInfo.validTasksCount[tier] > 0) {
        do {
            let taskInfo = this.tasksInfo[tasks[i]];
            //console.log(creep.name, tasks[i]);
            if (this.isTaskFree(taskInfo, roleInfo, tier)) {
                this.assignTask(creep, roleInfo, taskInfo, i);
                break;
            }
            if (backup == null && taskInfo.hasTarget) {
                backup = i;
            }
            i = (i + 1) % tasks.length;
        } while(i != lastCurrent);
    }

    if (!assigned && backup != null) {
        this.assignTask(creep, roleInfo, this.tasksInfo[tasks[i]], backup);
    }
};

Room.prototype.clearTask = function(creep) {
    let roleInfo = this.rolesInfo[creep.role.name];
    let taskInfo = this.tasksInfo[roleInfo.tasks[creep.task.tier][creep.task.current]];
    if (taskInfo.creeps[creep.name]) {
        console.log("Clearing", creep.name, "from", roleInfo.tasks[creep.task.tier][creep.task.current]);
        taskInfo.creepsCount--;
        delete taskInfo.creeps[creep.name];
    }
    else {
        console.log("Trying to clear", creep.name, "of unassigned task");
    }
};

Room.prototype.switchTask = function(creep) {
    var roleInfo = this.rolesInfo[creep.role.name];
    creep.task.tier = (creep.task.tier + 1) % roleInfo.tasks.length;
    creep.task.current = creep.task.tasks[creep.task.tier];
    //console.log("Switching to tier", creep.task.tier, "for", creep.name);
    if (creep.task.current == undefined) {
        this.assignNewTask(creep);
    }
    //if there are free tasks and current task is not one of them and reassiging away from crrent task doesnt make it a free task
    else if (roleInfo.hasFreeTasks[creep.task.tier] &&
             !roleInfo.freeTasks[creep.task.tier][roleInfo.tasks[creep.task.tier][creep.task.current]] &&
             !this.isTaskFree(this.tasksInfo[roleInfo.tasks[creep.task.tier][creep.task.current]], roleInfo, creep.task.tier, 1)) {
        this.reassignTask(creep);
    }
};

Room.prototype.reassignTask = function(creep) {
    this.clearTask(creep);
    this.assignNewTask(creep);
};

Room.prototype.creepHasDied = function(creep) {
    for (let roleName in ROLES) {
        ROLES[roleName].creepHasDied(this, creep);
    }
    for (let taskName in TASKS) {
        TASKS[taskName].creepHasDied(this, creep);
    }
    if (creep.task) {
        this.clearTask(creep);
    }
    var roleInfo = this.rolesInfo[creep.role.name];
    delete this.creeps[creep.name];
    roleInfo.creepsCount--;
};
