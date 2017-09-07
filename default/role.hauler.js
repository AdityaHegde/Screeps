/* globals CARRY, MOVE, SOURCE_ENERGY_CAPACITY, CARRY_CAPACITY, ENERGY_REGEN_TIME */

let utils = require("utils");
let WorkerRole = require("role.worker");

/**
 * Builder role.
 * @module role
 * @class HaulerRole
 * @extends WorkerRole
 */

let HaulerRole = WorkerRole.extend({
    getMaxCount: function () {
        // have a container for each source and one more for controller and another one for towers
        // hauler will haul from each container to other sources
        return this.room.sourceManager.sources.length + 2;
    },

    getMaxParts: function () {
        // CARRY parts = trips needed with 1 CARRY part per energy regen cycle / total possible trips per cycle
        // trips needed with 1 CARRY part per energy regen cycle = energy available / CARRY capacity / ticks in a regen cycle
        // total possible trips per cycle = ticks in a regen cycle / average time per trip
        // average time per trip = 2 * average one way trip distance + ticks to withdraw (1) + ticks to deposit (1)
        // we need to have a corresponding MOVE part per CARRY part
        return 2 * Math.ceil((SOURCE_ENERGY_CAPACITY / CARRY_CAPACITY / ENERGY_REGEN_TIME) /
                             (ENERGY_REGEN_TIME / (2 * this.averageHaulDistance + 2)));
    }
}, {
    PARTS: [CARRY, MOVE],
    MAIN_PARTS: [CARRY],
    TASKS: [
        ["withdraw"],
        ["dropoff", "supply"]
    ],
    ROLE_NAME: "hauler"
});

utils.definePropertyInMemory(HaulerRole, "averageHaulDistance", function () {
    return 1;
});

module.exports = HaulerRole;
