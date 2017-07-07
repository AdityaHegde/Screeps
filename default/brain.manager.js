let utils = require("utils");
let BaseClass = require("base.class");

let Brain = BaseClass("brain");

utils.definePropertyInMemory(Brain.prototype, "rooms", function() {
    return Object.keys(Game.rooms);
});

utils.definePropertyInMemory(Brain.prototype, "isInitialized", function() {
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
