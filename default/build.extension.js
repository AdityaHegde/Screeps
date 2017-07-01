var roadBuilder = require("build.road");
var _ = require("lodash");
var SIN45 = Math.sin(-Math.PI / 4), COS45 = Math.cos(-Math.PI / 4);
var SIN90 = Math.sin(-Math.PI / 2), COS90 = Math.cos(-Math.PI / 2);

module.exports = _.merge({}, roadBuilder, {
    type : STRUCTURE_EXTENSION,

    init : function(room) {
        let plannerInfo = {
            paths : [],
            roadCursor : 0,
            pathCursor : 0,
        };

        //road builder has already calculated paths to sources, add positions for extensions beside that path
        let allocatedCount = 0;
        for (let i = 1; i < room.tempRoadPaths.length; i++) {
            var path = room.tempRoadPaths[i];
            var path1 = [], path2 = [];

            //have a buffer of 2 slots for creating extensions
            for (var j = 1; j < path.length - 1; j++) {
                var dx, dy;

                if (path[j].dx == path[j-1].dx && path[j].dy == path[j-1].dy) {
                    dx = Math.round(COS90 * path[j].dx - SIN90 * path[j].dy);
                    dy = Math.round(SIN90 * path[j].dx + COS90 * path[j].dy);
                }
                else if ((path[j].dx * path[j].dy == 0 && path[j-1].dx * path[j-1].dy == 0) ||
                    (path[j].dx * path[j].dy != 0 && path[j-1].dx * path[j-1].dy != 0)) {
                    dx = Math.round(COS45 * path[j-1].dx - SIN45 * path[j-1].dy);
                    dy = Math.round(SIN45 * path[j-1].dx + COS45 * path[j-1].dy);
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
        }

        return plannerInfo;
    },

    addPathEntry : function(path1, path2, pathEntry, dx, dy) {
        path1.push({
            x : pathEntry.x + dx,
            y : pathEntry.y + dy,
            dx : pathEntry.dx,
            dy : pathEntry.dy,
            direction : pathEntry.direction,
        });
        path2.push({
            x : pathEntry.x - dx,
            y : pathEntry.y - dy,
            dx : pathEntry.dx,
            dy : pathEntry.dy,
            direction : pathEntry.direction,
        });
    },
});
