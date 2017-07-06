let BaseRole = require("role.base");

/**
 * Defender role.
 * @module role
 * @class DefenderRole
 * @extends BaseRole
 */

module.exports = BaseRole.extend({
    getMaxCount : function(room, roleInfo) {
        //spawn only if there is an enemy army
        return room.defence.enemyArmy ? 3 : 0;
    },
},{
    PARTS : [RANGED_ATTACK, MOVE],
    MAIN_PARTS : [RANGED_ATTACK],
    TASKS : [
        ["position"],
        ["shoot"],
    ],
    ROLE_NAME : "defender",
});
