let constants = require("constants");
let utils = require("utils");
let BaseBuild = require("build.base");

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
        structures.push(this.room.controller, ...this.room.sourceManager.sources.map(source => Game.getObjectById(source)));
        //structures.push(this.room.controller, ...this.room.find(FIND_SOURCES));

        this.room.tempRoadPaths = [];

        structures.forEach((target, i) => {
            let roadPath = this.room.findPath(spawn.pos, target.pos, {
                ignoreCreeps : true,
                ignoreDestructibleStructures : true,
                ignoreRoads : true,
            });
            if (i > 0) {
                target.container = [roadPath[roadPath.length - 2].x, roadPath[roadPath.length - 2].y];
            }
            this.room.tempRoadPaths.push(roadPath);
            this.paths.push(Room.serializePath(roadPath));
        });
    },
}, {
    TYPE : STRUCTURE_ROAD,
    BUILD_NAME : "road",
});
