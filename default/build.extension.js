var roadBuilder = require("build.road");
var _ = require("lodash");
var SIN45 = Math.sin(-Math.PI / 4), COS45 = Math.cos(-Math.PI / 4);

module.exports = _.merge({}, roadBuilder, {
    type : STRUCTURE_EXTENSION,

    init : function(room) {
        let plannerInfo = {
            paths : [],
            roadCursor : 0,
            pathCursor : 0,
            pathPartCurosr : 0,
        };

        //road builder has already calculated paths to sources, add positions for extensions beside that path
        let allocatedCount = 0;
        let visual = new RoomVisual(room.name);
        for (let i = 1; i < room.tempRoadPaths.length; i++) {
            let path = room.tempRoadPaths[i];
            let path1 = [], path2 = [];

            //have a buffer of 2 slots for creating extensions
            for (let j = 1; j < path.length; j++) {
                let dx, dy;
                if ((path[j].dx * path[j].dy == 0 && path[j-1].dx * path[j-1].dy == 0) ||
                    (path[j].dx * path[j].dy != 0 && path[j-1].dx * path[j-1].dy != 0)) {
                    dx = COS45 * path[j-1].dx - SIN45 * path[j-1].dy;
                    dy = SIN45 * path[j-1].dx + COS45 * path[j-1].dy;
                }
                else if (path[j].dx * path[j].dy == 0) {
                    dx = path[j].dy;
                    dy = path[j].dx;
                }
                else if (path[j-1].dx * path[j-1].dy == 0) {
                    dx = path[j-1].dy;
                    dy = path[j-1].dx;
                }

                this.addPathEntry(path1, path2, path[j], dx, dy);
            }

            plannerInfo.paths.push(Room.serializePath(path1), Room.serializePath(path2));
            visual.poly(path1, {
                lineStyle : "dotted",
                color : "yellow",
            });
            visual.poly(path2, {
                lineStyle : "dotted",
                color : "yellow",
            });

            return plannerInfo;
        }
    },

    addPathEntry : function(path1, path2, pathEntry, dx, dy) {
        path1.push({
            x : pathEntry.x + dx,
            y : pathEntry.y + dy,
            dx : pathEntry.dx,
            dy : pathEntry.dy,
        });
        path2.push({
            x : pathEntry.x - dx,
            y : pathEntry.y - dy,
            dx : pathEntry.dx,
            dy : pathEntry.dy,
        });
    },
});
