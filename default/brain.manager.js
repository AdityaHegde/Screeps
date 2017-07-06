let utils = require("utils");
let roomManager = require("room.manager");

utils.definePropertyInMemory(Flag.prototype, "rooms", function() {
    return [this.room.name];
});

Flag.prototype.init = function() {
    this.rooms.forEach(function(roomName) {
        Game.rooms[roomName].init();
    });
};

Flag.prototype.tick = function() {
    this.rooms.forEach(function(roomName) {
        Game.rooms[roomName].tick();
    });
};
