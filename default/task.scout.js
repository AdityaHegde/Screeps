let constants = require("constants");
let BaseTask = require("task.base");

/**
 * Scout nearby rooms
 *
 * @module task
 * @class ScoutTask
 * @extends BaseTask
 */

//TODO scout more than just the immeadiate rooms
let ScoutTask = BaseTask.extend({
    execute : function(creep) {
        if (creep.room.name != creep.task.rooms[0]) {
            return creep.moveTo(new RoomPosition(25, 25, creep.task.rooms[0]), {
                reusePath : 15,
            });
        }
        else {
            this.room.fireEvent(constants.ROOM_SCOUTED, creep.room.name);
            creep.task.rooms.shift();
            return creep.task.rooms.length > 0 ? OK : constants.ERR_INVALID_TASK;
        }
    },

    getTargetRooms : function(sourceRoom, direction, size) {
        let rooms = [];
        let roomMatch = sourceRoom.match(/^(W|E)(\d*)(N|S)(\d*)$/);
        let dirX = roomMatch[1], dirY = roomMatch[3];
        let x = Number(roomMatch[2]) * (dirX == "W" ? -1 : 1) + (direction == RIGHT) - (direction == LEFT);
        let y = Number(roomMatch[4]) * (dirY == "S" ? -1 : 1) + (direction == BOTTOM) - (direction == TOP);

        for (let i = x - size; i <= x + size; i++) {
            for (let j = y - size; j < y + size; j++) {
                let roomName = (i > 0 ? "E" : "W") + Math.abs(i) + (j > 0 ? "N" : "S") + Math.abs(j);
                if (!this.ownedRooms[roomName]) {
                    rooms.push(roomName);
                }
            }
        }
    },

    updateOwnedRooms : function(rooms) {
        rooms.forEach((room) => {
            this.ownedRooms[room] = 1;
        });
    },

    taskStarted : function(creep) {
        let exits = Game.map.describeExits(creep.room.name);
        let direction = _.find([TOP, RIGHT, BOTTOM, LEFT], function(dir) {
            return _.has(exits, dir);
        });
        creep.task.rooms = this.getTargetRooms(creep.room.name, direction, 1);
    },
}, {
    EVENT_LISTENERS : [{
        eventName : constants.ROOM_CLAIMED,
        method : "updateOwnedRooms",
    }],
    TASK_NAME : "scout",
});

utils.definePropertyInMemory(ScoutTask, "ownedRooms", function() {
    return {};
});

module.exports = ScoutTask;
