var constants = require("constants");
var utils = require("utils");

utils.definePropertyInMemory(Room.prototype, "spawns", function() {
    return [];
});

utils.definePropertyInMemory(Room.prototype, "listen_events", function() {
    return {};
});

Object.defineProperties(Room.prototype, {
    init : function() {
    },

    tick : function() {
        this.fire_events = {};
        if (this.spawns.length === 0 || this.listen_events[constants.SPAWN_CREATED]) {
            this.spawns = this.find(FIND_MY_SPAWNS).map(spawn => spawn.id);
        }

        this.listen_events = this.fire_events;
    },
});
