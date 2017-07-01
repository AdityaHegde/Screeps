var constants = require("constants");

module.exports = {
    PARTS : [WORK, CARRY, MOVE, MOVE],
    TASKS : [
        ["harvest"],
        ["dropoff", "build", "upgrade", "repair"],
    ],

    UPDATES : {
        2 : [
            ["harvest"],
            ["dropoff", "build", "upgrade", "repair"],
        ],
        6 : [
            ["boost"],
            ["harvest"],
            ["dropoff", "build", "upgrade", "repair"],
        ],
    },

    init : function(room, roleInfo) {
        roleInfo.tasks = _.cloneDeep(this.TASKS);
        roleInfo.parts = this.parts.slice();
        roleInfo.partsCost = this.parts.reduce(function(partsCost, part) {
            return partsCost + BODYPART_COST[part];
        });
        roleInfo.i = 0;
    },

    tick : function(room, roleInfo) {
        /*if (room..listenEvents[constants.RCL_UPDATED] && this.UPDATES[room.controller.level]) {
            roleInfo.tasks = this.UPDATES[room.controller.level].slice();
            roleInfo.updatedTasks = true;
        }
        else {
            roleInfo.updatedTasks = false;
        }*/

        var newPart = this.PARTS[roleInfo.i];

        //if the available energy capacity can accommodate the new part
        if (room.energyCapacityAvailable >= roleInfo.partsCost + BODYPART_COST[newPart] + BODYPART_COST[MOVE]) {
            roleInfo.parts.push(newPart, MOVE);
            roleInfo.parts = roleInfo.parts.sort();
            roleInfo.partsCost += BODYPART_COST[newPart] + BODYPART_COST[MOVE];
            roleInfo.i = roleInfo.i == 0 ? 1 : 0;

            console.log("Upgraded the creeps parts to", roleInfo.parts.join(","));
        }
    },

    getMaxCount : function(room, roleInfo) {
        return room.sourceManager.totalAvailableSpaces;
    },
};
