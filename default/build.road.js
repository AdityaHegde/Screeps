let constants = require("constants");
let utils = require("utils");
let BuildBase = require("build.base");

/**
* Class to auto build roads
* @module build
* @class RoadBuild
* @extends BaseBuild
*/

module.exports = BaseBuild.extend({
    init : function(room) {
        this.room = room;

        PathFinder.use();

        let spawn = Game.spawns[this.room.spawns[0]];
        let structures = [];
        structures.push(this.room.controller, ...this.room.sources.map(source => Game.getObjectById(source)));
        //structures.push(this.room.controller, ...this.room.find(FIND_SOURCES));

        this.room.tempRoadPaths = [];

        structures.forEach((target) => {
            let roadPath = this.room.findPath(spawn.pos, target.pos, {
                ignoreCreeps : true,
                ignoreDestructibleStructures : true,
                ignoreRoads : true,
            });
            this.room.tempRoadPaths.push(roadPath);
            this.paths.push(Room.serializePath(roadPath));
        });
    },
}, {
    TYPE : STRUCTURE_ROAD,
});
