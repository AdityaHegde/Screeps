let constants = require("constants");
let ContainerBuild = require("build.container");

/**
* Class to auto build walls
* @module build
* @class TowerBuild
* @extends ContainerBuild
*/

module.exports = ContainerBuild.extend({
    getCursorObjects : function(buildPlanner) {
        return buildPlanner.buildInfo.wall.paths;
    },

    initForCursorObject : function(buildPlanner, cursorObject) {
        let path = Room.deserializePath(cursorObject);
        let x1 = path[1].x, y1 = path[1].y;
        let x2 = path[path.length - 2].x, y2 = path[path.length - 2].y;
        let mid = Math.round(path.length / 2);
        let mx = Math.round((x1 + x2) / 2), my = Math.round((y1 + y2) / 2);
        let dx = path[mid].dx, dy = path[mid].dy;

        if (!this.checkAndAdd(buildPlanner.room, mx - dy, my + dx)) {
            for (let j = 0; j < mid; j++) {
                if (this.checkAndAdd(buildPlanner.room, mx + dx * j - dy, my + dy * j + dx) ||
                this.checkAndAdd(buildPlanner.room, mx - dx * j - dy, my - dy * j + dx)) {
                    break;
                }
            }
        }
    },
}, {
    EVENT_LISTENERS : [],
    TYPE : STRUCTURE_TOWER,
    BUILD_NAME : "tower",
});
