let BaseRole = require("role.base");

/**
 * Builder role.
 * @module role
 * @class UpgraderRole
 * @extends BaseRole
 */

module.exports = BaseRole.extend({
    getMaxCount : function(room, roleInfo) {
        return 1;
    },
}, {
    PARTS : [WORK, CARRY, CARRY, MOVE],
    MAIN_PARTS : [WORK],
    TASKS : [
        ["withdraw.upgrader"],
        ["upgrade"],
    ],
    ROLE_NAME : "upgrader",
});
