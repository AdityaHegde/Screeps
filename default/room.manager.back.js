let constants = require("constants");
let utils = require("utils");
let ROLES_SUITES = require("role.list").suites;
let ROLES = require("role.list").roles;
let TASKS = require("task.list").tasks;
let TASKS_INIT_ORDER = require("task.list").initOrder;
let BUILD_TYPES = require("build.list").types;
let sourceManager = require("source.manager");
let creepManager = require("creep.manager");
let structureManager = require("structure.manager");
let enemyArmy = require("army.enemy");
let eventBus = require("event.bus");
let BuildPlanner = require("build.planner");

for (let buildName in BUILD_TYPES) {
    BUILD_TYPES[buildName].init();
}
for (let taskName in TASKS) {
    TASKS[taskName].init();
}
for (let roleName in ROLES) {
    ROLES[roleName].init();
}

utils.definePropertyInMemory(Room, "roleSuite", function() {
    return 0;
});

utils.definePropertyInMemory(Room, "spawns", function() {
    return this.find(FIND_MY_SPAWNS).map((spawn) => spawn.name);
});

utils.definePropertyInMemory(Room, "spawnsQueueCursor", function() {
    return 0;
});

utils.definePropertyInMemory(Room, "creeps", function() {
    return {};
});

utils.defineMapPropertyInMemory(Room, "rolesInfo", "roles", ROLES);

utils.defineMapPropertyInMemory(Room, "tasksInfo", "tasks", TASKS);

utils.defineInstancePropertyInMemory(Room, "buildPlanner", BuildPlanner);

utils.definePropertyInMemory(Room, "defence", function() {
    return {
        enemyArmy : null,
        defenders : [],
    };
});

utils.definePropertyInMemory(Room, "delayedEvents", function() {
    return {};
});

utils.definePropertyInMemory(Room, "avgCpuUsed", function() {
    return 0;
});

utils.definePropertyInMemory(Room, "maxCpuUsed", function() {
    return 0;
});

utils.definePropertyInMemory(Room, "isInitialized", function() {
    return 0;
});

Room.prototype.init = function() {
    if (this.buildPlanner.init(this)) {
        this.isInitialized = 2;
    }
    else if (this.isInitialized == 0) {
        this.addSources();

        ROLES_SUITES[this.roleSuite].order.forEach((roleName) => {
            this.rolesInfo.addKey(roleName, new ROLES[roleName]());
            this.rolesInfo[roleName].init(this);
        });

        TASKS_INIT_ORDER.forEach((taskName) => {
            this.tasksInfo.addKey(taskName, new TASKS[taskName]());
            this.tasksInfo[taskName].init(this);
        });

        this.isInitialized = 1;
    }
};

Room.prototype.tick = function() {
    let begCpu = Game.cpu.getUsed();

    for (let eventName in this.delayedEvents) {
        eventBus.fire(eventName, this, this.delayedEvents[eventName]);
        delete this.delayedEvents[eventName];
    }

    if (this.spawns.length == 0) {
        this.spawns.push(...this.find(FIND_MY_SPAWNS).map(spawn => spawn.id));
    }
    this.fireEvents = {};

    this.roleManager();
    this.buildPlanner.build();
    this.defendRoom();

    if (Game.time % 5 == 0) {
        this.fireEvent(constants.PERIODIC_5_TICKS, 1);
    }
    if (Game.time % 10 == 0) {
        this.fireEvent(constants.PERIODIC_10_TICKS, 1);
    }
    if (Game.time % 20 == 0) {
        this.fireEvent(constants.PERIODIC_20_TICKS, 1);
    }

    if (this.fireEvents[constants.SPAWN_CREATED]) {
        this.spawns.push(...this.fireEvents[constants.SPAWN_CREATED].map(spawn => spawn.id));
    }

    for (let eventName in this.fireEvents) {
        eventBus.fire(eventName, this, this.fireEvents[eventName]);
    }

    let cpuUsed = Game.cpu.getUsed() - begCpu;
    this.avgCpuUsed += cpuUsed;

    if (cpuUsed > this.maxCpuUsed) {
        this.maxCpuUsed = cpuUsed;
    }
    if (Game.time % 20 == 0) {
        console.log("Average CPU used for", this.name, ":", (this.avgCpuUsed / 20), "Max CPU :", this.maxCpuUsed);
        this.avgCpuUsed = 0;
        this.maxCpuUsed = 0;
    }
};

Room.prototype.roleManager = function() {
    let roleSuite = ROLES_SUITES[this.roleSuite];

    //if its time to switch to next role
    if (roleSuite.switchRole(this)) {
        console.log("Switching role suite");
        let oldSuite = ROLES_SUITES[this.roleSuite];
        this.roleSuite++;
        roleSuite = ROLES_SUITES[this.roleSuite];
        //initialize new roles
        roleSuite.order.forEach((roleName) => {
            console.log("New role", roleName);
            this.rolesInfo.addKey(roleName, new ROLES[roleName]());
            this.rolesInfo[roleName].init(this);
        });

        //distribute creeps from older roles to new ones
        for (let role in roleSuite.creepDistribution) {
            let i = 0, j = 0;
            for (let creepName in this.rolesInfo[role].creeps) {
                let targetRoleName = roleSuite.creepDistribution[role][i];
                let newRole = this.rolesInfo[targetRoleName];
                let creep = Game.creeps[creepName];
                j = i;
                this.rolesInfo[creep.role.name].removeCreep(creep);
                while (newRole && newRole.creepsCount >= newRole.getMaxCount()) {
                    if (i == j) {
                        //if the loop has come all the way back to the beginig, suicide the creep as there are no free roles
                        creep.suicide();
                        delete Memory.creeps[creep.name];
                        newRole = null;
                    }
                    else {
                        //else get the next role
                        targetRoleName = roleSuite.creepDistribution[role][i];
                        newRole = this.rolesInfo[targetRoleName];
                    }
                    i = (i + 1) % roleSuite.creepDistribution[role].length;
                }
                if (newRole) {
                    newRole.addCreep(creep);
                }
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

Room.prototype.creepHasDied = function(creep) {
    //console.log(creep.name, "has died");
    ROLES_SUITES[this.roleSuite].order.forEach((roleName) => {
        let roleInfo = this.rolesInfo[roleName];
        this.rolesInfo[roleName].creepHasDied(creep);
    });

    for (let taskName in this.tasksInfo) {
        this.tasksInfo[taskName].creepHasDied(creep);
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
            this.fireEvents[constants.ENEMY_AT_THE_GATE] = this.defence.enemyArmy.targets.splice();
        }
    }
};

Room.prototype.fireEvent = function(eventName, target) {
    this.fireEvents[eventName] = this.fireEvents[eventName] || [];
    if (_.isArray(target)) {
        this.fireEvents[eventName].push(...target);
    }
    else {
        this.fireEvents[eventName].push(target);
    }
};

Room.prototype.fireDelayedEvent = function(eventName, target) {
    this.delayedEvents[eventName] = this.delayedEvents[eventName] || [];
    if (_.isArray(target)) {
        this.delayedEvents[eventName].push(...target);
    }
    else {
        this.delayedEvents[eventName].push(target);
    }
};

Room.prototype.reset = function() {
    for (let roleName in this.rolesInfo) {
        let role = this.rolesInfo[roleName];
        for (let creepName in role.creeps) {
            let creep = Game.creeps[creepName];
            if (!creep) {
                delete role.creeps[creepName];
            }
            else {
                if (creep.task) {
                    creep.task.tasks = {};
                    creep.task.tier = 0;
                    creep.task.targets = {};
                    delete creep.task.current;
                }
            }
        }

        role.creepsCount = Object.keys(role.creeps).length;
    }

    for (let taskName in this.tasksInfo) {
        let task = this.tasksInfo[taskName];
        task.creeps = {};
        task.creepsCount = 0;
        task.init(this);
    }
};
