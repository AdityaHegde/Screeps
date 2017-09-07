/* globals _, Game, STRUCTURE_SPAWN */

let roadBuild = require("build.road");

/**
* Class to auto build walls
* @module build
* @class SpawnBuild
* @extends RoadBuild
*/

module.exports = _.merge({}, roadBuild, {
    initForCursorObject: function (buildPlanner, cursorObject, idx) {
        let spawn = Game.spawns[buildPlanner.room.spawns[0]];

        return [{
            x: spawn ? spawn.pos.x : cursorObject.x + 1,
            y: spawn ? spawn.pos.y : cursorObject.y + 1,
            pathIdx: 0,
            pathPos: 0
        }, {
            x: cursorObject.x,
            y: cursorObject.y - 1,
            pathIdx: 1,
            pathPos: 0
        }, {
            x: cursorObject.x - 1,
            y: cursorObject.y,
            pathIdx: 2,
            pathPos: 0
        }].map((pos) => {
            buildPlanner.costMatrix.set(pos.x, pos.y, 255);
            buildPlanner.structureData[pos.x + "__" + pos.y] = [pos.pathIdx, pos.pathPos];
            return pos.x + ":" + pos.y;
        });
    },

    TYPE: STRUCTURE_SPAWN
});
