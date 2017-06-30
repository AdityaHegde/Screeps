var constants = require("constants");

var TASKS = [
    ["harvest"],
    ["dropoff", "upgrade"],
];
var TASKS_AT_RCL2 = [
    ["harvest"],
    ["dropoff", "build", "upgrade", "repair"],
];
var TASKS_AT_RCL6 = [
    ["boost"],
    ["harvest"],
    ["dropoff", "build", "upgrade", "repair"],
];

module.exports = {
    TASKS : [
        ["harvest"],
        ["dropoff", "upgrade"],
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
        roleInfo.tasks = this.TASKS.slice();
    },

    tick : function(room, roleInfo) {
        if (room.memory.listen_events[constants.RCL_UPDATED] && this.UPDATES[room.controller.level]) {
            roleInfo.tasks = this.UPDATES[room.controller.level].slice();
            roleInfo.updatedTasks = true;
        }
        else {
            roleInfo.updatedTasks = false;
        }
    },
};
