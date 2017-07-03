var baseRole = require("role.base");

/**
 * Builder role.
 * @module role
 * @Class HaulerRole
 * @extends BaseRole
 */

module.exports = _.merge({}, baseRole, {
    PARTS : [CARRY, MOVE],
    MAIN_PARTS : [CARRY],
    TASKS : [
        ["withdraw"],
        ["dropoff"],
    ],

    getMaxCount : function(room, roleInfo) {
        //have a container for each source and one more for controller
        //hauler will haul from each container to other sources
        return 3;
    },
});
