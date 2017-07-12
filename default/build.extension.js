let constants = require("constants");
let math = require("math");
let BaseBuild = require("build.base");
let SIN45 = Math.sin(-Math.PI / 4), COS45 = Math.cos(-Math.PI / 4);
let SIN90 = Math.sin(-Math.PI / 2), COS90 = Math.cos(-Math.PI / 2);

/**
* Class to auto build extensions
* @module build
* @class ExtensionBuild
* @extends BaseBuild
*/

module.exports = BaseBuild.extend({
    getCursorObjects : function(buildPlanner) {
        return buildPlanner.buildInfo.road.paths.slice(1, buildPlanner.room.sourceManager.sources.length);
    },

    initForCursorObject : function(buildPlanner, cursorObject, i) {
        let path = Room.deserializePath(cursorObject);
        let path1 = [], path2 = [];

        //have a buffer of 2 slots for creating extensions
        for (let i = 1; i < path.length - 1; i++) {
            let dxdy = math.getDxDy(path[i-1], path[i]);

            this.addPathEntry(path1, path2, path[i], dxdy[0], dxdy[1]);
        }

        this.paths.push(Room.serializePath(path1), Room.serializePath(path2));
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
}, {
    TYPE : STRUCTURE_EXTENSION,
    BUILD_NAME : "extension",
});
