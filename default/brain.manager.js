let utils = require("utils");
let BaseClass = require("base.class");
let roomManager = require("room.manager");

let Brain = BaseClass("brain");

utils.definePropertyInMemory(Brain, "rooms", function() {
    return Object.keys(Game.rooms);
});

utils.definePropertyInMemory(Brain, "isInitialized", function() {
    return false;
});

Brain.prototype.init = function() {
    this.rooms.forEach(function(roomName) {
        Game.rooms[roomName].init();
    });
};

Brain.prototype.tick = function() {
    this.rooms.forEach(function(roomName) {
        Game.rooms[roomName].tick();
    });
};

module.exports = Brain;
