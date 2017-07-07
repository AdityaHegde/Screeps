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
let eventBus = require("event.bus");

utils.definePropertyInMemory(Room.prototype, "roleSuite", function() {
    return 0;
});

utils.definePropertyInMemory(Room.prototype, "spawns", function() {
    return this.find(FIND_MY_SPAWNS).map((spawn) => spawn.name);
});

utils.definePropertyInMemory(Room.prototype, "spawnsQueueCursor", function() {
    return 0;
});

utils.definePropertyInMemory(Room.prototype, "creeps", function() {
    return {};
});

utils.defineMapPropertyInMemory(Room.prototype, "rolesInfo", "roles");

utils.defineMapPropertyInMemory(Room.prototype, "tasksInfo", "tasks");

utils.defineMapPropertyInMemory(Room.prototype, "buildInfo", "build");

utils.definePropertyInMemory(Room.prototype, "basePlanner", function() {
    return {
        lastLevel : this.controller.level,
        cursor : BUILD_TYPES.length,
    };
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

    BUILD_INIT_ORDER.forEach((buildTypeIdx) => {
        let buildType = BUILD_TYPES[buildTypeIdx];
        this.buildInfo.addKey(buildType.name, new buildType.api());
        this.buildInfo[buildType.name].init(this);
    });

    for (let roleName in ROLES[this.roleSuite].roles) {
        this.rolesInfo.addKey(roleName, new ROLES[this.roleSuite].roles[roleName]());
        this.rolesInfo[roleName].init(this);
    }

    for (let taskName in TASKS) {
        this.tasksInfo.addKey(taskName, new TASKS[taskName]());
        this.tasksInfo[taskName].init(this);
    }
};

Room.prototype.tick = function() {
    if (this.spawns.length == 0) {
        this.spawns.push(...this.find(FIND_MY_SPAWNS).map(spawn => spawn.id));
    }
    this.fireEvents = {};

    this.roleManager();
    this.planBuilding();
    this.defendRoom();

    if (this.fireEvents[constants.SPAWN_CREATED]) {
        this.spawns.push(...this.fireEvents[constants.SPAWN_CREATED].map(spawn => spawn.id));
    }

    for (var eventName in this.fireEvents) {
        eventBus.fire(eventName, this, this.fireEvents[eventName]);
    }
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
            this.rolesInfo.addKey(role, new roleSuite.roles[role]());
            this.rolesInfo[role].init(this);
        }

        //distribute creeps from older roles to new ones
        for (let role in roleSuite.creepDistribution) {
            let i = 0;
            for (let creepName in this.rolesInfo[role].creeps) {
                let creep = Game.creeps[creepName];
                let targetRoleName = roleSuite.creepDistribution[role][i];
                this.rolesInfo[creep.role.name].removeCreep(creep);
                this.rolesInfo[targetRoleName].addCreep(creep);
                i = (i + 1) % roleSuite.creepDistribution[role].length;
            }
            delete this.rolesInfo[role];
        }
    }

    for (let taskName in this.tasksInfo) {
        this.tasksInfo[taskName].tick();
    }

    //execute in specified order to give some roles priority
    roleSuite.order.forEach((roleName) => {
        this.rolesInfo[roleName].tick();
        /*console.log(roleName, ":", Object.keys(this.rolesInfo[roleName].creeps).map((creepName) => {
            let creep = Game.creeps[creepName];
            return creep.name + " (" + (creep.task ? this.rolesInfo.tasks[creep.task.tier][creep.task.current] : "") + ")";
        }).join("  "));*/
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
            let buildInfo = this.buildInfo[BUILD_TYPES[this.basePlanner.cursor].name];
            if (!buildInfo.build()) {
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
        this.rolesInfo[roleName].creepHasDied(creep);

        roleInfo.tasks.forEach((taskTiers, i) => {
            taskTiers.forEach((taskName) => {
                this.tasksInfo[taskName].creepHasDied(creep);
            });
        });
    }
};

Room.prototype.defendRoom = function() {
    if (this.defence.enemyArmy) {
    }
    else {
        //do this every tick to improve response time
        let hostiles = this.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            this.defence.enemyArmy = enemyArmy.init(room, hostiles);
        }
        this.fireEvents[constants.ENEMY_AT_THE_GATE] = 1;
    }
};
