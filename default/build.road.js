let constants = require("constants");
let utils = require("utils");
let BaseBuild = require("build.base");

/**
* Class to auto build roads
* @module build
* @class RoadBuild
* @extends BaseBuild
*/

module.exports = {
    initForCursorObject : function(buildPlanner, cursorObject, i) {
        if (!(cursorObject.source instanceof RoomPosition)) {
            cursorObject.source = new RoomPosition(cursorObject.source.x, cursorObject.source.y, buildPlanner.room.name);
        }
        if (!(cursorObject.target instanceof RoomPosition)) {
            cursorObject.target = new RoomPosition(cursorObject.target.x, cursorObject.target.y, buildPlanner.room.name);
        }
        let path = buildPlanner.room.findPath(cursorObject.source, cursorObject.target, {
            maxRooms : 1,
            costCallback : () => {
                return buildPlanner.costMatrix;
            },
        });

        //set the caclulated path to the cost matrix
        for (let i = 1; i < path.length; i++) {
            buildPlanner.costMatrix.set(path[i].x, path[i].y, 1);
        }

        if (buildPlanner.rooms.sources[i].pos.isEqualTo(cursorObject.target)) {
            buildPlanner.rooms.sources[i].pathIdx = i;
            buildPlanner.rooms.sources[i].pathPos = path.length;
        }

        let retPath = buildPlanner.room.addPath(path);

        return [retPath];
    },

    build : function(buildPlanner) {
        //store the last built road block to resume later when max construction site has been reached
        let c = 0;
        if (buildPlanner.pathCursor == this.paths.length) {
            //return true if this type of structure was finished before
            return true;
        }

        for (; buildPlanner.pathCursor < this.paths.length; buildPlanner.pathCursor++) {
            let path = Room.deserializePath(this.paths[buildPlanner.pathCursor]);

            for (; buildPlanner.posCursor < path.length; buildPlanner.posCursor++) {
                let returnValue = this.buildAt(buildPlanner, path[buildPlanner.posCursor].x, path[buildPlanner.posCursor].y);
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
            buildPlanner.posCursor = 0;
        }

        buildPlanner.room.fireEvents[constants.CONSTRUCTION_COMPLETED] = this.TYPE;

        //build only one type at a time
        return false;
    },

    buildAt : function(buildPlanner, x, y) {
        let returnValue = buildPlanner.room.createConstructionSite(x, y, this.TYPE);
        buildPlanner.room.delayedEvents[constants.CONSTRUCTION_SITE_ADDED] = 1;
    },

    built : function(buildPlanner, structure) {
        let key = structure.pos.x + "__" + structure.pos.y;
        if (buildPlanner.structureData[key]) {
            structure.pathIdx = buildPlanner.structureData[key][0];
            structure.pathPos = buildPlanner.structureData[key][1];
            delete buildPlanner.structureData[key];
        }
    },

    TYPE : STRUCTURE_ROAD,
};
