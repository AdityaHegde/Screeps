let constants = require("constants");
let utils = require("utils");
let ROLES = require("role.list");
let TASKS = require("task.list");
let BUILD_TYPES = require("build.list").types;
let BUILD_INIT_ORDER = require("build.list").initOrder;
let sourceManager = require("source.manager");
let creepManager = require("creep.manager");
let structureManager = require("structure.manager");
let enemyArmy = require("army.enemy");

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
    let rolesInfo = {};
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
    let basePlanner = {
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
    this.basePlanner;
    this.addSources();
    this.rolesInfo;
    this.tasksInfo;
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
    let roleSuite = ROLES[this.roleSuite];

    //if its time to switch to next role
    if (roleSuite.switchRole(this)) {
        console.log("Switching role suite");
        let oldSuite = ROLES[this.roleSuite];
        this.roleSuite++;
        roleSuite = ROLES[this.roleSuite];
        //initialize new roles
        for (let role in roleSuite.roles) {
            console.log("New role", role);
            this.rolesInfo[role] = roleSuite.roles[role].init(this, this.rolesInfo[role]);
        }

        //distribute creeps from older roles to new ones
        for (let role in roleSuite.creepDistribution) {
            let i = 0;
            for (let creepName in this.rolesInfo[role].creeps) {
                let creep = Game.creeps[creepName];
                let targetRoleName = roleSuite.creepDistribution[role][i];
                oldSuite.roles[creep.role.name].removeCreep(this, creep, this.rolesInfo[role]);
                roleSuite.roles[targetRoleName].addCreep(this, creep, this.rolesInfo[targetRoleName], targetRoleName);
                i = (i + 1) % roleSuite.creepDistribution[role].length;
            }
            delete this.rolesInfo[role];
        }
    }

    for (let taskName in TASKS) {
        let taskInfo = this.tasksInfo[taskName];
        TASKS[taskName].tick(this, taskInfo);
    }

    //execute in specified order to give some roles priority
    roleSuite.order.forEach((roleName) => {
        let roleInfo = this.rolesInfo[roleName];
        let roleApi = ROLES[this.roleSuite].roles[roleName];
        /*console.log(roleName, ":", Object.keys(roleInfo.creeps).map((creepName) => {
            let creep = Game.creeps[creepName];
            return creep.name + " (" + (creep.task ? roleInfo.tasks[creep.task.tier][creep.task.current] : "") + ")";
        }).join("  "));*/
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
        let roleInfo = this.rolesInfo[roleName];
        ROLES[this.roleSuite].roles[roleName].creepHasDied(this, creep, roleInfo);

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
        let hostiles = this.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            this.defence.enemyArmy = enemyArmy.init(room, hostiles);
        }
    }
};
