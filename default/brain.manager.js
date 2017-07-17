let utils = require("utils");
let BaseClass = require("base.class");
let roomManager = require("room.manager");

let Brain = BaseClass("brain", "brains");

utils.definePropertyInMemory(Brain, "rooms", function() {
    return Object.keys(Game.rooms);
});

Brain.prototype.tick = function() {
    this.rooms.forEach((roomName) => {
        let room = Game.rooms[roomName];

        if (room.controller.my) {
            if (room.isInitialized == 2) {
                room.tick();
            }
            else {
                room.init();
            }

            // if (this.rooms.length > 0) {
            //     let visual = new RoomVisual(room.name);
            //     room.buildPlanner.pathsInfo.forEach((pathInfo) => {
            //         pathInfo.paths.forEach((path) => {
            //             if (path.match(/^\d*:\d*$/)) {
            //                 let xy = path.split(":");
            //                 visual.circle(Number(xy[0]), Number(xy[1]), {fill : (pathInfo.type == "tower" ? "red" : "white")});
            //             }
            //             else {
            //                 path = Room.deserializePath(path);
            //                 visual.poly(path, {lineStyle: "dashed"});
            //             }
            //         })
            //     });
            // }
        }
    });
};

module.exports = Brain;
