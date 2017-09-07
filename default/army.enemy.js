/* globals _, FIND_HOSTILE_CREEPS, ATTACK, RANGED_ATTACK, HEAL */

let TARGET_TYPE_ORDER = ["healers", "melee", "ranged"];
let math = require("math");
let utils = require("utils");
let BaseClass = require("base.class");

/**
 * Assembles enemy army and returns possbible targets in priority order
 * @module army
 * @submodule enemy
 * @class EnemyArmy
 */

EnemyArmy = BaseClass("enemyArmy", "enemyArmies");

utils.definePropertyInMemory(EnemyArmy, "roomName")

utils.definePropertyInMemory(EnemyArmy, "enemyCreepInfo", function () {
    return {};
});

utils.defineHeapPropertyInMemory(EnemyArmy, "enemyArmy");

EnemyArmy.prototype.tick = function () {
    let room = Game.rooms[this.roomName];
    let creeps = room.find(FIND_HOSTILE_CREEPS);
    let creepByName = {};
    this.enemyCreeps = [];

    // assign the compareFunction. funcitons cannot be stored in memory.
    this.enemyArmy.compareFunction = (a, b) => {
        return this.enemyCreepInfo[a].weight - this.enemyCreepInfo[b].weight;
    };

    // go through all creeps and
    creeps.forEach((creep) => {
        let weight = this.getWeightForCreep(creep);
        creepByName[creep.name] = creep;
        if (!this.enemyCreepInfo[creep.name]) {
            this.enemyCreepInfo[creep.name] = this.getCreepInfo(creep);
            this.enemyArmy.add(creep.name);
        } else if (this.enemyCreepInfo[creep.name].weight !== weight) {
            this.enemyCreepInfo[creep.name].weight = weight;
            this.enemyArmy.update(creep.name);
        }
    });

    let removeCreeps = [];

    this.enemyArmy.array.forEach((creepName) => {
        if (creepByName[creepName]) {
            this.enemyCreepInfo[creepName].lastSeen = 0;
            this.enemyCreeps.push(creepByName[creepName]);
        } else {
            this.enemyCreepInfo[creepName].lastSeen++;
            if (this.enemyCreepInfo[creepName].lastSeen > 5) {
                removeCreeps.push(creepName);
            }
        }
    });

    removeCreeps.forEach((creepName) => {
        this.enemyArmy.delete(creepName);
        delete this.enemyCreepInfo[creepName];
    });
};

EnemyArmy.prototype.getWeightForCreep = function(creep) {
    return creep.hits;
};

EnemyArmy.prototype.getCreepInfo = function(creep) {
    let room = Game.rooms[this.roomName];
    let direction = math.getExitByPos(creep.pos);
    return {
        weight : this.getWeightForCreep(creep),
        lastSeen : 0,
    };
};

module.exports = EnemyArmy;
