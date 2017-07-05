let workerRole = require("role.worker");

/**
 * Builder role.
 * @module role
 * @Class BuilderRole
 * @extends WorkerRole
 */

module.exports = _.assign({}, workerRole, {
    PARTS : [WORK, CARRY, MOVE, MOVE],
    MAIN_PARTS : [WORK, CARRY],
    TASKS : [
        ["withdraw"],
        //let build and repair be managed by the same role,
        //with auto balancing
        ["build", "repair"],
    ],
    ROLE_NAME : "builder",

    getMaxCount : function(room, roleInfo) {
        return 4;
    },
});
