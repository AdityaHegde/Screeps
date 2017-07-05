var extensionBuilder = require("build.container");

module.exports = _.assign({}, extensionBuilder, {
    type : STRUCTURE_TOWER,

    init : function(room) {
        let plannerInfo = {
            paths : [],
            roadCursor : 0,
            pathCursor : 0,
        };

        for (let i = 0; i < room.tempWallPaths.length; i++) {
            let x1 = room.tempWallPaths[i][1].x, y1 = room.tempWallPaths[i][1].y;
            let x2 = room.tempWallPaths[i][room.tempWallPaths[i].length - 2].x, y2 = room.tempWallPaths[i][room.tempWallPaths[i].length - 2].y;
            let mid = Math.round(room.tempWallPaths.length / 2);
            let mx = Math.round((x1 + x2) / 2), my = Math.round((y1 + y2) / 2);
            let dx = room.tempWallPaths[i][mid].dx, dy = room.tempWallPaths[i][mid].dy;

            if (!this.checkAndAdd(mx - dy, my + dx, room, plannerInfo.paths)) {
                for (let j = 0; j < mid; j++) {
                    if (this.checkAndAdd(mx + dx * j - dy, my + dy * j + dx, room, plannerInfo.paths) ||
                        this.checkAndAdd(mx - dx * j - dy, my - dy * j + dx, room, plannerInfo.paths)) {
                        break;
                    }
                }
            }
        }

        return plannerInfo;
    },
});
