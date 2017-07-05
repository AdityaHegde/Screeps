var baseRole = require("role.base");

/**
 * Builder role.
 * @module role
 * @Class HarvesterRole
 * @extends BaseRole
 */

module.exports = _.assign({}, baseRole, {
    PARTS : [WORK, CARRY, CARRY, MOVE],
    MAIN_PARTS : [WORK],
    TASKS : [
        ["harvest"],
        ["store"],
    ],
    ROLE_NAME : "harvester",

    getMaxCount : function(room, roleInfo) {
        //have a container for each source and one more for controller
        //hauler will haul from each container to other sources
        return room.sourceManager.sources.length;
    },
});
