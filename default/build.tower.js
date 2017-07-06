let constants = require("constants");
let ContainerBuild = require("build.container");

/**
* Class to auto build walls
* @module build
* @class TowerBuild
* @extends ContainerBuild
*/

module.exports = ContainerBuild.extend({
    init : function(room) {
        this.room = room;

        for (let i = 0; i < this.room.tempWallPaths.length; i++) {
            let x1 = this.room.tempWallPaths[i][1].x, y1 = this.room.tempWallPaths[i][1].y;
            let x2 = this.room.tempWallPaths[i][this.room.tempWallPaths[i].length - 2].x, y2 = this.room.tempWallPaths[i][this.room.tempWallPaths[i].length - 2].y;
            let mid = Math.round(this.room.tempWallPaths.length / 2);
            let mx = Math.round((x1 + x2) / 2), my = Math.round((y1 + y2) / 2);
            let dx = this.room.tempWallPaths[i][mid].dx, dy = this.room.tempWallPaths[i][mid].dy;

            if (!this.checkAndAdd(mx - dy, my + dx, this.room, this.paths)) {
                for (let j = 0; j < mid; j++) {
                    if (this.checkAndAdd(mx + dx * j - dy, my + dy * j + dx, this.room, this.paths) ||
                        this.checkAndAdd(mx - dx * j - dy, my - dy * j + dx, this.room, this.paths)) {
                        break;
                    }
                }
            }
        }
    },
}, {
    EVENT_LISTENERS : [],
    TYPE : STRUCTURE_TOWER,
});
