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
        //ticks available to work until regen = (ticks to regen energy - ticks needed to deposit harvested energy)
        //ticks needed to deposit harvested energy = energy available / carry capacity per body * 2, we have 2 CARRY parts
        //we need to have a corresponding MOVE part per Work part and 2 CARRY parts
        return 2 * Math.ceil(SOURCE_ENERGY_CAPACITY / HARVEST_POWER /
                             (ENERGY_REGEN_TIME - SOURCE_ENERGY_CAPACITY / (CARRY_CAPACITY * 2)))) + 2;
    },
}, {
    PARTS : [WORK, CARRY, CARRY, MOVE],
    MAIN_PARTS : [WORK],
    TASKS : [
        ["harvest"],
        ["store"],
    ],
    ROLE_NAME : "harvester",
});
