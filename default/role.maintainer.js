var baseRole = require("role.base");

/**
 * Builder role.
 * @module role
 * @Class BuilderRole
 * @extends BaseRole
 */

module.exports = _.assign({}, baseRole, {
    PARTS : [WORK, CARRY, MOVE, MOVE],
    MAIN_PARTS : [WORK, CARRY],
    TASKS : [
        ["withdraw"],
        ["repair"],
    ],
    ROLE_NAME : "maintainer",

    getMaxCount : function(room, roleInfo) {
        return 2;
    },
});
