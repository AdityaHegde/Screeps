let utils = require("utils");
let BaseClass = require("base.class");
let roomManager = require("room.manager");

let Brain = BaseClass("brain");

utils.definePropertyInMemory(Brain, "rooms", function() {
    return Object.keys(Game.rooms);
});

Brain.prototype.tick = function() {
    this.rooms.forEach((roomName) => {
        let room = Game.rooms[roomName];

        if (room.isInitialized == 2) {
            room.tick();
        }
        else {
            room.init();
        }
    });

    if (this.rooms.length > 0) {
        let visual = new RoomVisual(this.rooms[0].name);
        for (let build in Memory.build) {
            Memory.build[build].paths.forEach((path) => {
                if (_.isString(path)) {
                    path = Room.deserializePath(path);
                    visual.poly(path, {lineStyle: "dashed"});
                }
                else {
                    visual.circle(path[0], path[1], {fill : "white"});
                }
            });
        }
    }
};

module.exports = Brain;
