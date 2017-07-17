let constants = require("constants");
let utils = require("utils");
let math = require("math");
let roadBuild = require("build.road");

/**
* Class to auto build extensions
* @module build
* @class ExtensionBuild
* @extends RoadBuild
*/

let ExtensionBuild = _.merge({}, roadBuild, {
    initForCursorObject : function(buildPlanner, cursorObject, idx) {
        let path = Room.deserializePath(cursorObject.path);
        let path1 = [], path2 = [];

        //have a buffer of 2 slots for creating extensions
        for (let i = 1; i < path.length - 1; i++) {
            let dxdy = math.getDxDy(path[i-1], path[i]);

            path1.push({
                x : path[i].x + dxdy[0],
                y : path[i].y +  dxdy[1],
                dx : path[i].dx,
                dy : path[i].dy,
                direction : path[i].direction,
            });
            buildPlanner.structureData[(path[i].x + dxdy[0]) + "__" + (path[i].y +  dxdy[1])] = [idx, i];
            path2.push({
                x : path[i].x - dxdy[0],
                y : path[i].y -  dxdy[1],
                dx : path[i].dx,
                dy : path[i].dy,
                direction : path[i].direction,
            });
            buildPlanner.structureData[(path[i].x - dxdy[0]) + "__" + (path[i].y -  dxdy[1])] = [idx, i];
        }

        return [Room.serializePath(path1), Room.serializePath(path2)];
    },

    TYPE : STRUCTURE_EXTENSION,
});

module.exports = ExtensionBuild;
