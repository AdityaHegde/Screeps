let WorkerRole = require("role.worker");

/**
 * Builder role.
 * @module role
 * @class HaulerRole
 * @extends WorkerRole
 */

module.exports = WorkerRole.extend({
    getMaxCount : function(room, roleInfo) {
        //have a container for each source and one more for controller
        //hauler will haul from each container to other sources
        return 4;
    },
}, {
    PARTS : [CARRY, MOVE],
    MAIN_PARTS : [CARRY],
    TASKS : [
        ["withdraw"],
        ["dropoff", "supply"],
    ],
    ROLE_NAME : "hauler",
});
