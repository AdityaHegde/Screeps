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

    getMaxCount : function(room, roleInfo) {
        //have a container for each source and one more for controller
        //hauler will haul from each container to other sources
        return 1;
    },
});
