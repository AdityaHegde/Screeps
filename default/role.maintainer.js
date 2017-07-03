var baseRole = require("role.base");

/**
 * Builder role.
 * @module role
 * @Class BuilderRole
 * @extends BaseRole
 */

module.exports = _.merge({}, baseRole, {
    PARTS : [WORK, CARRY, MOVE, MOVE],
    MAIN_PARTS : [WORK, CARRY],
    TASKS : [
        ["withdraw"],
        ["repair"],
    ],

    getMaxCount : function(room, roleInfo) {
        return 2;
    },
});
