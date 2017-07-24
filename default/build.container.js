let constants = require("constants");
let utils = require("utils");
let extensionBuild = require("build.extension");

/**
* Class to auto build walls
* @module build
* @class ContainerBuild
* @extends ExtensionBuild
*/

let ContainerBuild = _.merge({}, extensionBuild, {
    initForCursorObject : function(buildPlanner, pathInfo, idx) {
        let pos, posIdx;
        let path = pathInfo.path;
        let newPath;
        let label;
        if (idx == buildPlanner.room.sourceManager.sources.length) {
            posIdx = path.length - 4;
            buildPlanner.room.controller.container = path[posIdx];
            label = constants.UPGRADER_STORAGE;
        }
        else {
            posIdx = path.length - 2;
            buildPlanner.room.sources[idx].container = path[posIdx];
            label = constants.HARVESTER_STORAGE;
        }

        return [this.checkAndAdd(buildPlanner, path[posIdx], idx, posIdx, undefined, label)];
    },

    //build structures in positions
    //returns true if all structures are built for the current RCL, false if max sites has been reached
    build : function(buildPlanner) {
        //store the last built road block to resume later when max construction site has been reached
        let c = 0;
        if (buildPlanner.pathCursor == this.paths.length) {
            //return true if this type of structure was finished before
            return true;
        }

        for (; buildPlanner.pathCursor < this.paths.length; buildPlanner.pathCursor++) {
            let xy = this.paths[buildPlanner.pathCursor].split(":");
            let returnValue = this.buildAt(buildPlanner, xy[0], xy[1]);
            c++;
            //if max sites has been reached or if RCL is not high enough, return
            if (returnValue == ERR_FULL || returnValue == ERR_RCL_NOT_ENOUGH) {
                //return true if RCL is not high enough, used to skip building a type for the current RCL
                return returnValue == ERR_RCL_NOT_ENOUGH;
            }
            //limit the operations
            else if (c >= 5) {
                return false;
            }
        }


        buildPlanner.room.fireEvents[constants.CONSTRUCTION_COMPLETED] = this.type;

        //build only one type at a time
        return false;
    },

    TYPE : STRUCTURE_CONTAINER,
});

module.exports = ContainerBuild;
