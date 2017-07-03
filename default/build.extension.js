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

        room.tempExtensionsPath = [];

        //road builder has already calculated paths to sources, add positions for extensions beside that path
        let allocatedCount = 0;
        for (let i = 1; i < room.tempRoadPaths.length; i++) {
            var path = room.tempRoadPaths[i];
            var path1 = [], path2 = [];

            //have a buffer of 2 slots for creating extensions
            for (var j = 1; j < path.length - 1; j++) {
                let dxdy = this.getDxDy(path[j-1], path[j]);

                this.addPathEntry(path1, path2, path[j], dxdy[0], dxdy[1]);
            }

            plannerInfo.paths.push(Room.serializePath(path1), Room.serializePath(path2));
            room.tempExtensionsPath.push(path1, path2);
        }

        return plannerInfo;
    },

    getDxDy : function(pos0, pos1) {
        let dx, dy;

        if (pos1.dx == pos0.dx && pos1.dy == pos0.dy) {
            return this.getPerpendicularDxDy(pos1.dx, pos1.dy);
        }
        else if ((pos1.dx * pos1.dy == 0 && pos0.dx * pos0.dy == 0) ||
            (pos1.dx * pos1.dy != 0 && pos0.dx * pos0.dy != 0)) {
            dx = Math.round(COS45 * pos0.dx - SIN45 * pos0.dy);
            dy = Math.round(SIN45 * pos0.dx + COS45 * pos0.dy);
        }
        else if (pos1.dx * pos1.dy == 0) {
            dx = pos1.dy;
            dy = pos1.dx;
        }
        else if (pos0.dx * pos0.dy == 0) {
            dx = pos0.dy;
            dy = pos0.dx;
        }

        return [dx, dy];
    },

    getPerpendicularDxDy : function(dx, dy) {
        return [Math.round(COS90 * dx - SIN90 * dy), Math.round(SIN90 * dx + COS90 * dy)];
    },

    addPathEntry : function(path1, path2, pathEntry, dx, dy) {
        path1.push({
            x : pathEntry.x - dx,
            y : pathEntry.y + dy,
            dx : pathEntry.dx,
            dy : pathEntry.dy,
            direction : pathEntry.direction,
        });
        path2.push({
            x : pathEntry.x + dx,
            y : pathEntry.y - dy,
            dx : pathEntry.dx,
            dy : pathEntry.dy,
            direction : pathEntry.direction,
        });
    },
});
