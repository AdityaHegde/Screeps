let workerRole = require("role.worker");

/**
 * Builder role.
 * @module role
 * @Class HaulerRole
 * @extends WorkerRole
 */

module.exports = _.assign({}, workerRole, {
    PARTS : [CARRY, MOVE],
    MAIN_PARTS : [CARRY],
    TASKS : [
        ["withdraw"],
        ["dropoff", "supply"],
    ],
    ROLE_NAME : "hauler",

    getMaxCount : function(room, roleInfo) {
        //have a container for each source and one more for controller
        //hauler will haul from each container to other sources
        return 4;
    },
});
