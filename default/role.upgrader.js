var baseRole = require("role.base");

/**
 * Builder role.
 * @module role
 * @Class UpgraderRole
 * @extends BaseRole
 */

module.exports = _.merge({}, baseRole, {
    PARTS : [WORK, CARRY, CARRY, MOVE],
    MAIN_PARTS : [WORK],
    TASKS : [
        ["withdraw"],
        ["upgrade"],
    ],
    ROLE_NAME : "upgrader",

    getMaxCount : function(room, roleInfo) {
        return 1;
    },
});
