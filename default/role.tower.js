var baseRole = require("role.base");

/**
 * Tower role.
 * @module role
 * @Class TowerRole
 * @extends BaseRole
 */

module.exports = _.merge({}, baseRole, {
    PARTS : [WORK, CARRY, MOVE, MOVE],
    MAIN_PARTS : [WORK, CARRY],
    TASKS : [
        ["repair", "shoot"],
    ],
    ROLE_NAME : "tower",

    getMaxCount : function(room, roleInfo) {
        //tower is built seperately
        return 0;
    },
});
