/* globals WORK, CARRY, MOVE */

let WorkerRole = require("role.worker");

/**
 * Builder role.
 * @module role
 * @class BuilderRole
 * @extends WorkerRole
 */

module.exports = WorkerRole.extend({
    getMaxCount: function () {
        return 2 + this.room.tasksInfo.build.hasTarget * 2;
    }
}, {
    PARTS: [WORK, CARRY, MOVE, MOVE],
    MAIN_PARTS: [WORK, CARRY],
    TASKS: [
        ["withdraw"],
        // let build and repair be managed by the same role,
        // with auto balancing
        ["build", "repair"]
    ],
    ROLE_NAME: "builder"
});
