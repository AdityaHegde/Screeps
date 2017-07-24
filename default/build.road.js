let constants = require("constants");
let utils = require("utils");

/**
* Class to auto build roads
* @module build
* @class RoadBuild
* @extends BaseBuild
*/

module.exports = {
    initForCursorObject : function(buildPlanner, cursorObject, idx) {
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
        //add the source too
        path.unshift({
            x : cursorObject.source.x,
            y : cursorObject.source.y,
            dx : 0,
            dy : -1,
            direction : TOP,
        });

        //set the caclulated path to the cost matrix
        buildPlanner.structureData[path[0].x + "__" + path[0].y] = [idx, 0];
        for (let i = 1; i < path.length; i++) {
            buildPlanner.costMatrix.set(path[i].x, path[i].y, 1);
            buildPlanner.structureData[path[i].x + "__" + path[i].y] = [idx, i];
        }

        if (buildPlanner.room.sources.length > idx &&
            buildPlanner.room.sources[idx].isEqualTo(cursorObject.target)) {

            buildPlanner.room.sources[idx].pathIdx = idx;
            buildPlanner.room.sources[idx].pathPos = path.length;
        }

        let connections = {};
        for (let i = 0; i < idx - 1; i++) {
            connections[i] = {
                fromPos : 0,
                toPos : 0,
            };
        }
        buildPlanner.room.pathManager.addPath(path, connections, true);

        return [buildPlanner.room.pathManager.pathsInfo[idx].memory.path];
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
                buildPlanner.room.fireDelayedEvent(constants.CONSTRUCTION_SCEDULED, [x, y]);
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
    },

    built : function(buildPlanner, structure) {
        let key = structure.pos.x + "__" + structure.pos.y;
        if (buildPlanner.structureData[key]) {
            structure.pathIdx = buildPlanner.structureData[key][0];
            structure.pathPos = buildPlanner.structureData[key][1];
            delete buildPlanner.structureData[key];
        }
    },

    constructionSiteAdded : function(buildPlanner, constructionSite) {
        let key = constructionSite.pos.x + "__" + constructionSite.pos.y;
        if (buildPlanner.structureData[key]) {
            constructionSite.pathIdx = buildPlanner.structureData[key][0];
            constructionSite.pathPos = buildPlanner.structureData[key][1];
            if (buildPlanner.structureData[key][2]) {
                constructionSite.moveAway = buildPlanner.structureData[key][2];
            }
        }
    },

    TYPE : STRUCTURE_ROAD,
};
