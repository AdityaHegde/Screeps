var constants = require("constants");
var baseRole = require("role.base");

/**
 * Tower role.
 * @module role
 * @Class TowerRole
 * @extends BaseRole
 */

module.exports = _.assign({}, baseRole, {
    PARTS : [WORK, CARRY, MOVE, MOVE],
    MAIN_PARTS : [WORK, CARRY],
    TASKS : [
        ["repair", "shoot"],
    ],
    ROLE_NAME : "tower",

    spawnCreeps : function(room, roleInfo) {
        if (room.listenEvents[constants.TOWER_BUILT]) {
            room.listenEvents[constants.TOWER_BUILT].forEach((towerId) => {
                let tower = Game.getObjectById(towerId);
                this.addCreep(room, tower, roleInfo);
            })
        }
    },

    upgradeParts : function() {
        //dummy
    },

    getMaxCount : function(room, roleInfo) {
        //tower is built seperately
        return 0;
    },
});
