module.exports = function () {
    global.TOP = 1;
    global.TOP_RIGHT = 2;
    global.RIGHT = 3;
    global.BOTTOM_RIGHT = 4;
    global.BOTTOM = 5;
    global.BOTTOM_LEFT = 6;
    global.LEFT = 7;
    global.TOP_LEFT = 8;

    global.OK = "ok";

    global.STRUCTURE_ROAD = "road";
    global.STRUCTURE_TOWER = "tower";
    global.STRUCTURE_SPAWN = "spawn";
    global.STRUCTURE_EXTENSION = "extension";
    global.STRUCTURE_CONTAINER = "container";
    global.STRUCTURE_RAMPART = "rampart";
    global.STRUCTURE_WALL = "wall";

    global.LOOK_TERRAIN = "terrain";

    global.CONTROLLER_STRUCTURES = {
        tower : {
            8 : 6,
        },
        extension : {
            8 : 60,
        },
    };

    global.FIND_CONSTRUCTION_SITES = "findConstructionSites";
    global.FIND_SOURCES = "findSources";
    global.FIND_HOSTILE_CREEPS = "findHostileCreeps";

    global.LOOK_STRUCTURES = "lookStructures";

    global.ERR_INVALID_TARGET = "errInvalidTarget";
};
