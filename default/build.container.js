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
    initForCursorObject : function(buildPlanner, cursorObject, i) {
        let path = Room.deserializePath(cursorObject.path);
        let pos, posIdx;
        let newPath;
        if (i == buildPlanner.room.sourceManager.sources.length) {
            posIdx = path.length - 4;
            buildPlanner.room.controller.container = path[posIdx];
        }
        else {
            posIdx = path.length - 2;
            buildPlanner.room.sources[i].container = path[posIdx];
        }
        pos = path[posIdx];
        buildPlanner.structureData[pos.x + "__" + pos.y] = {
            label : constants.UPGRADER_STORAGE,
            idx : i,
            pos : posIdx,
        };
        newPath = this.checkAndAdd(buildPlanner.room, pos.x, pos.y);
        return newPath || [];
    },

    checkAndAdd : function(room, x, y) {
        if(Game.map.getTerrainAt(x, y, room.name) != "wall") {
            return [x + ":" + y];
        }
        return null;
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

    built : function(buildPlanner, container) {
        container.label = buildPlanner.structureData[container.pos.x + "__" + container.pos.y].label;
        container.pathIdx = buildPlanner.structureData[container.pos.x + "__" + container.pos.y].idx;
        container.pathPos = buildPlanner.structureData[container.pos.x + "__" + container.pos.y].pos;
        delete buildPlanner.structureData[container.pos.x + "__" + container.pos.y];
    },

    TYPE : STRUCTURE_CONTAINER,
});

module.exports = ContainerBuild;
