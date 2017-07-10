let BaseRole = require("role.base");

/**
 * Builder role.
 * @module role
 * @class HarvesterRole
 * @extends BaseRole
 */

module.exports = BaseRole.extend({
    getMaxCount : function() {
        //have a container for each source and one more for controller
        //hauler will haul from each container to other sources
        return this.room.sourceManager.sources.length;
    },

    getMaxParts : function() {
        //WORK parts = energy available / energy harvested per tick per body / ticks available to work until regen
        return 2 * Math.ceil(SOURCE_ENERGY_CAPACITY / HARVEST_POWER / ENERGY_REGEN_TIME);
    },
}, {
    PARTS : [WORK, MOVE],
    MAIN_PARTS : [WORK],
    ADD_MOVE : false,
    TASKS : [
        ["harvestForever"],
    ],
    ROLE_NAME : "harvester",
});
