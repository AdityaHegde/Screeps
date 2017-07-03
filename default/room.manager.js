var constants = require("constants");
var utils = require("utils");
var ROLES = require("role.list");
var TASKS = require("task.list");
var BUILD_TYPES = require("build.list").types;
var BUILD_INIT_ORDER = require("build.list").initOrder;
let sourceManager = require("source.manager");
let creepManager = require("creep.manager");
var enemyArmy = require("army.enemy");

utils.definePropertyInMemory(Room.prototype, "spawns", function() {
    return [];
});

utils.definePropertyInMemory(Room.prototype, "fireEvents", function() {
    return {};
});

utils.definePropertyInMemory(Room.prototype, "listenEvents", function() {
    return {};
});

utils.definePropertyInMemory(Room.prototype, "containerCount", function() {
    return 0;
});

utils.definePropertyInMemory(Room.prototype, "roleSuite", function() {
    return 0;
});

utils.definePropertyInMemory(Room.prototype, "rolesInfo", function() {
    var rolesInfo = {};
    for (let role in ROLES[this.roleSuite].roles) {
        rolesInfo[role] = ROLES[this.roleSuite].roles[role].init(this, rolesInfo[role]);
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

utils.definePropertyInMemory(Room.prototype, "defence", function() {
    return {
        enemyArmy : null,
        defenders : [],
    };
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

    this.roleManager();
    this.planBuilding();
    this.defendRoom();
};

Room.prototype.roleManager = function() {
    var roleSuite = ROLES[this.roleSuite];

    //if its time to switch to next role
    if (roleSuite.switchRole(this)) {
        this.roleSuite++;
        roleSuite = roleSuite;
        //initialize new roles
        for (let role in roleSuite.roles) {
            this.rolesInfo[role] = roleSuite.roles[role].init(this, this.rolesInfo[role]);
        }

        //distribute creeps from older roles to new ones
        for (let role in roleSuite.creepDistribution) {
            let i = 0;
            for (let creepName in rolesInfo[role].creeps) {
                var creep = Game.creeps[creepName];
                var targetRoleName = roleSuite.creepDistribution[role][i];
                roleSuite.roles[targetRoleName].addCreep(this, creep, this.rolesInfo[targetRoleName], targetRoleName);
                i = (i + 1) % roleSuite.creepDistribution[role].length;
            }
            delete this.rolesInfo[role];
        }
    }

    //execute in specified order to give some roles priority
    roleSuite.order.forEach((roleName) => {
        var roleInfo = this.rolesInfo[roleName];
        var roleApi = ROLES[this.roleSuite].roles[roleName];
        roleApi.tick(this, this.rolesInfo[roleName]);
    });
};

Room.prototype.planBuilding = function() {
    //check if RCL changed or some structures are yet to be built for current RCL
    //or there are some structures are being built
    if (!this.tasksInfo.build.hasTarget && (this.controller.level > this.basePlanner.lastLevel || this.basePlanner.cursor < BUILD_TYPES.length)) {
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

Room.prototype.creepHasDied = function(creep) {
    for (let roleName in ROLES[this.roleSuite].roles) {
        ROLES[this.roleSuite].roles[roleName].creepHasDied(this, creep);
        var roleInfo = this.rolesInfo[roleName];

        roleInfo.tasks.forEach((taskTiers, i) => {
            taskTiers.forEach((taskName) => {
                TASKS[taskName].creepHasDied(this, creep);
            });
        });
    }
};

Room.prototype.defendRoom = function() {
    if (this.defence.enemyArmy) {
    }
    else {
        var hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            this.defence.enemyArmy = enemyArmy.init(room, hostiles);
        }
    }
};
