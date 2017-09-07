/* globals _, STRUCTURE_CONTAINER */

let constants = require("constants");
let extensionBuild = require("build.extension");

/**
* Class to auto build walls
* @module build
* @class ContainerBuild
* @extends ExtensionBuild
*/

let ContainerBuild = _.merge({}, extensionBuild, {
    initForCursorObject: function (buildPlanner, pathInfo, idx) {
        let posIdx;
        let path = pathInfo.path;
        let label;
        if (idx === buildPlanner.room.sourceManager.sources.length) {
            posIdx = path.length - 4;
            buildPlanner.room.controller.container = path[posIdx];
            label = constants.UPGRADER_STORAGE;
        } else {
            posIdx = path.length - 2;
            buildPlanner.room.sources[idx].container = path[posIdx];
            label = constants.HARVESTER_STORAGE;
        }

        return [this.checkAndAdd(buildPlanner, path[posIdx], idx, posIdx, undefined, label)];
    },

    TYPE: STRUCTURE_CONTAINER
});

module.exports = ContainerBuild;
