var baseRole = require("role.base");

/**
 * Defender role.
 * @module role
 * @Class DefenderRole
 * @extends BaseRole
 */

module.exports = _.merge({}, baseRole, {
    PARTS : [RANGED_ATTACK, MOVE],
    MAIN_PARTS : [RANGED_ATTACK],
    TASKS : [
        ["position"],
        ["shoot"],
    ],
    ROLE_NAME : "defender",

    getMaxCount : function(room, roleInfo) {
        //spawn only if there is an enemy army
        return room.defence.enemyArmy ? 3 : 0;
    },
});
