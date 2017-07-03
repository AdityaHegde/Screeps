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
        rolesInfo[role] = ROLES[role].init(this, rolesInfo[role]);
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

    //check if RCL changed or some structures are yet to be built for current RCL
    //or there are some structures are being built
    if (!this.tasksInfo["build"].hasTarget && (this.controller.level > this.basePlanner.lastLevel || this.basePlanner.cursor < BUILD_TYPES.length)) {
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

    /*let visual = new RoomVisual(this.name);
    BUILD_TYPES.forEach((buildType) => {
        this.basePlanner.plannerInfo[buildType.name].paths.forEach((path) => {
            if (buildType.name == "container" || buildType.name == "tower") {
                visual.circle(path[0], path[1], {
                    radius : 0.15,
                    stroke : "red",
                });
            }
            else {
                visual.poly(Room.deserializePath(path), {
                    lineType : "dotted",
                    stroke : (buildType.name == "road" ? "yellow" : "white"),
                });
            }
        });
    });*/
};

Room.prototype.creepHasDied = function(creep) {
    for (let roleName in ROLES) {
        ROLES[roleName].creepHasDied(this, creep);
    }
    for (let taskName in TASKS) {
        TASKS[taskName].creepHasDied(this, creep);
    }
};
