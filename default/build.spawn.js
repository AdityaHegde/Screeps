let constants = require("constants");
let roadBuild = require("build.road");

/**
* Class to auto build walls
* @module build
* @class SpawnBuild
* @extends RoadBuild
*/

module.exports = _.merge({}, roadBuild, {
    initForCursorObject : function(buildPlanner, cursorObject, i) {
        let spawn = Game.spawns[buildPlanner.room.spawns[0]];

        return [{
            x : spawn ? spawn.pos.x : cursorObject.x + 1,
            y : spawn ? spawn.pos.y : cursorObject.y + 1,
        }, {
            x : cursorObject.x,
            y : cursorObject.y - 1,
        }, {
            x : cursorObject.x - 1,
            y : cursorObject.y,
        }].map((pos) => {
            buildPlanner.costMatrix.set(pos.x, pos.y, "0xff");
            return pos.x + ":" + pos.y;
        });
    },

    TYPE : STRUCTURE_SPAWN,
});
