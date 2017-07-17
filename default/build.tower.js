let constants = require("constants");
let math = require("math");
let containerBuild = require("build.container");

/**
* Class to auto build walls
* @module build
* @class TowerBuild
* @extends ContainerBuild
*/

module.exports = _.merge({}, containerBuild, {
    initForCursorObject : function(buildPlanner, cursorObject, idx) {
        let path = Room.deserializePath(cursorObject.path);
        let paths = [];

        //have a buffer of 2 slots for creating extensions
        for (let i = 1; i < path.length - 1 && paths.length < 2; i++) {
            let dxdy = math.getDxDy(path[i-1], path[i]);

            [[path[i].x + dxdy[0], path[i].y + dxdy[1]],
             [path[i].x - dxdy[0], path[i].y - dxdy[1]]].forEach((pos) => {
                console.log(pos[0], pos[1]);
                if (paths.length < 2) {
                    let retPos = this.checkAndAdd(buildPlanner.room, pos[0], pos[1]);
                    if (retPos) {
                        paths.push(...retPos);
                        buildPlanner.structureData[pos[0] + "__" + pos[1]] = [idx, i];
                        buildPlanner.costMatrix.set(pos[0], pos[1], 0xff);
                    }
                }
            });
        }

        return paths;
    },

    TYPE : STRUCTURE_TOWER,
});
