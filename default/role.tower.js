let constants = require("constants");
let BaseRole = require("role.base");

/**
 * Tower role.
 * @module role
 * @class TowerRole
 * @extends BaseRole
 */

module.exports = BaseRole.extend({
    spawnCreeps : function(room, roleInfo) {
        //dummy
    },

    upgradeParts : function() {
        //dummy
    },

    getMaxCount : function(room, roleInfo) {
        //tower is built seperately
        return 0;
    },
}, {
    EVENT_LISTENERS : [{
        //add tower as a creep so that it gets executed in the role/task pipeline
        eventName : constants.TOWER_BUILT,
        method : "addCreep",
    }],
    TASKS : [
        ["repair", "shoot"],
    ],
    ROLE_NAME : "tower",
});
