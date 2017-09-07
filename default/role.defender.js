/* globals RANGED_ATTACK, MOVE */

let BaseRole = require("role.base");

/**
 * Defender role.
 * @module role
 * @class DefenderRole
 * @extends BaseRole
 */

module.exports = BaseRole.extend({
    getMaxCount: function () {
        // spawn only if there is an enemy army
        return this.room.defence.enemyArmy ? 3 : 0;
    }
}, {
    PARTS: [RANGED_ATTACK, MOVE],
    MAIN_PARTS: [RANGED_ATTACK],
    TASKS: [
        ["position"],
        ["defendShoot"]
    ],
    ROLE_NAME: "defender"
});
