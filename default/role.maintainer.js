let BaseRole = require("role.base");

/**
 * Builder role.
 * @module role
 * @class MaintainerRole
 * @extends BaseRole
 */

module.exports = BaseRole.extend({
    getMaxCount : function(room, roleInfo) {
        return 2;
    },
}, {
    PARTS : [WORK, CARRY, MOVE, MOVE],
    MAIN_PARTS : [WORK, CARRY],
    TASKS : [
        ["withdraw"],
        ["repair"],
    ],
    ROLE_NAME : "maintainer",
});
