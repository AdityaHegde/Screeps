/* globals _, STRUCTURE_TOWER */

let containerBuild = require("build.container");

/**
* Class to auto build walls
* @module build
* @class TowerBuild
* @extends ContainerBuild
*/

module.exports = _.merge({}, containerBuild, {
    initForCursorObject: function (buildPlanner, pathInfo, idx) {
        let parallelPath0 = pathInfo.parallelPath0;
        let parallelPath1 = pathInfo.parallelPath1;
        let paths = [];

        // have a buffer of 2 slots for creating extensions
        for (let i = 0; i < parallelPath0.length && i < parallelPath1.length && paths.length < 2; i++) {
            [parallelPath0[i], parallelPath1[i]].forEach((pos) => {
                if (paths.length < 2) {
                    this.checkAndAddToPoints(buildPlanner, paths, pos, idx, i);
                }
            });
        }

        return paths;
    },

    TYPE: STRUCTURE_TOWER
});
