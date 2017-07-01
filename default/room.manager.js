var constants = require("constants");
var utils = require("utils");
var ROLES = require("role.list");
var TASKS = require("task.list");
var BUILD_TYPES = require("build.list");
let sourceManager = require("source.manager");
let creepManager = require("creepManager");

utils.definePropertyInMemory(Room.prototype, "spawns", function() {
    return [];
});

utils.definePropertyInMemory(Room.prototype, "listenEvents", function() {
    return {};
});

utils.definePropertyInMemory(Room.prototype, "rolesInfo", function() {
    var rolesInfo = {};
    for (let role in ROLES) {
        rolesInfo[role] = {
            tasks : [],
            creep : {},
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
    BUILD_TYPES.forEach(function(buildType) {
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
    this.fireEvents = {};
    if (this.spawns.length === 0 || this.listenEvents[constants.SPAWN_CREATED]) {
        this.spawns = this.find(FIND_MY_SPAWNS).map(spawn => spawn.id);
    }

    this.listenEvents = this.fireEvents;

    for (let taskName in TASKS) {
        TASKS[taskName].tick(this, this.tasksInfo[taskName]);
    }

    for (let creepName in this.creeps) {
        let creep = Game.creeps[creepName];

        if (creep) {
            creep.executeTask(this);
        }
        else if (Memory.creeps[creepName]) {
            Memory.creeps[creepName].name = creepName;
            this.creepHasDied(Memory.creeps[creepName]);
            delete Memory.creeps[creepName];
        }
    }

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
    }

    //check if RCL changed or some structures are yet to be built for current RCL
    if (this.controller.level > this.basePlanner.lastLevel || this.basePlanner.cursor < BUILD_TYPES.length) {
        //reset the cursor when executed for the 1st time RCL changed
        if (this.basePlanner.cursor == BUILD_TYPES.length) {
            this.basePlanner.cursor = 0;
        }

        for (; this.basePlanner.cursor < BUILD_TYPES.length; this.basePlanner.cursor++) {
            //if the structure is yet to be finished, break
            if (!BUILD_TYPES[this.basePlanner.cursor].api.build(this)) {
                break;
            }
        }
    }
    this.basePlanner.lastLevel = this.controller.level;
};

Room.prototype.assignTask = function(creep, isNew) {
    let roleInfo = this.rolesInfo[creep.role.name];
    let tasks = roleInfo.tasks[(isNew ? 0 : creep.task.tier)];
    let lastCurrent = isNew ? 0 : ((creep.task.current + 1) % tasks.length);
    let i = lastCurrent;

    do {
        let taskInfo = this.tasksInfo[tasks[i]];
        if (taskInfo.hasTarget && taskInfo.creepsCount < Math.round(roleInfo.creepsCount / tasks.length)) {
            creep.task = creep.task || {
                tier : 0,
                tasks : {},
            };
            creep.task.current = i;
            creep.task.tasks[creep.task.tier] = i;
            taskInfo.creepsCount++;
            console.log("Assigning", creep.name, "to", tasks[i]);
            break;
        }
        i = (i + 1) % tasks.length;
    } while(i != lastCurrent);
};

Room.prototype.clearTask = function(creep) {
    let roleInfo = this.rolesInfo[creep.role.name];
    let taskInfo = this.tasksInfo[roleInfo.tasks[creep.task.tier][creep.task.current]];
    console.log("Clearing", creep.name, "from", roleInfo.tasks[creep.task.tier][creep.task.current]);
    taskInfo.creepsCount--;
};

Room.prototype.switchTask = function(creep) {
    this.clearTask(creep);
    var roleInfo = this.rolesInfo[creep.role.name];
    creep.task.tier = (creep.task.tier + 1) % roleInfo.tasks.length;
    creep.task.current = creep.task.tasks[creep.task.tier];
    //console.log("Switching to tier", creep.task.tier, "for", creep.name);
    if (creep.task.current == undefined) {
        //TODO rebalance
        this.assignTask(creep, true);
    }
};

Room.prototype.reassignTask = function(creep) {
    this.clearTask(creep);
    this.assignTask(creep);
};

Room.prototype.creepHasDied = function(creep) {
    if (creep.task) {
        this.clearTask(creep);
    }
    var roleInfo = this.rolesInfo[creep.role.name];
    delete this.creeps[creep.name];
    roleInfo.creepsCount--;
};
