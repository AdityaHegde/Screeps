/* globals Room, RoomPosition, TOP, ERR_FULL, ERR_RCL_NOT_ENOUGH, STRUCTURE_ROAD */

let constants = require("constants");

/**
* Class to auto build roads
* @module build
* @class RoadBuild
* @extends BaseBuild
*/

module.exports = {
    initForCursorObject: function (buildPlanner, cursorObject, idx) {
        let path = buildPlanner.room.findPath(cursorObject.source, cursorObject.target.pos, {
            maxRooms: 1,
            costCallback: () => {
                return buildPlanner.costMatrix;
            }
        });
        // add the source too
        path.unshift({
            x: cursorObject.source.x,
            y: cursorObject.source.y,
            dx: 0,
            dy: -1,
            direction: TOP
        });

        // set the caclulated path to the cost matrix
        buildPlanner.structureData[path[0].x + "__" + path[0].y] = [idx, 0];
        for (let i = 1; i < path.length; i++) {
            buildPlanner.costMatrix.set(path[i].x, path[i].y, 1);
            buildPlanner.structureData[path[i].x + "__" + path[i].y] = [idx, i];
        }

        let newPathInfos = buildPlanner.room.pathManager.addPath(path, true);
        let lastPathInfo = newPathInfos[newPathInfos.length - 1];

        // path.length - 1 is the position of the target, but it is not pathable
        // path.length - 2 will be the position of the container which is where creep has to go to harvest
        cursorObject.target.pathData = [lastPathInfo.id, lastPathInfo.path.length - 2];

        return newPathInfos.map(newPathInfo => newPathInfo.path);
    },

    build: function (buildPlanner) {
        // store the last built road block to resume later when max construction site has been reached
        let c = 0;
        if (buildPlanner.pathCursor === this.paths.length) {
            // return true if this type of structure was finished before
            return true;
        }

        for (; buildPlanner.pathCursor < this.paths.length; buildPlanner.pathCursor++) {
            let path = Room.deserializePath(this.paths[buildPlanner.pathCursor]);

            for (; buildPlanner.posCursor < path.length; buildPlanner.posCursor++) {
                let returnValue = this.buildAt(buildPlanner,
                    path[buildPlanner.posCursor].x, path[buildPlanner.posCursor].y);
                buildPlanner.room.fireDelayedEvent(constants.CONSTRUCTION_SCEDULED,
                    [path[buildPlanner.posCursor].x, path[buildPlanner.posCursor].y]);
                c++;
                // if max sites has been reached or if RCL is not high enough, return
                if (returnValue === ERR_FULL || returnValue === ERR_RCL_NOT_ENOUGH) {
                    // return true if RCL is not high enough, used to skip building a type for the current RCL
                    return returnValue === ERR_RCL_NOT_ENOUGH;
                } else if (c >= 5) {
                    // limit the operations
                    return false;
                }
            }
            buildPlanner.posCursor = 0;
        }

        buildPlanner.room.fireEvents[constants.CONSTRUCTION_COMPLETED] = this.TYPE;

        // build only one type at a time
        return false;
    },

    buildAt: function (buildPlanner, x, y) {
        return buildPlanner.room.createConstructionSite(x, y, this.TYPE);
    },

    built: function (buildPlanner, structure) {
        let key = structure.pos.x + "__" + structure.pos.y;
        if (buildPlanner.structureData[key]) {
            structure.pathData = buildPlanner.structureData[key];
            delete buildPlanner.structureData[key];
        }
    },

    constructionSiteAdded: function (buildPlanner, constructionSite) {
        let key = constructionSite.pos.x + "__" + constructionSite.pos.y;
        if (buildPlanner.structureData[key]) {
            constructionSite.pathData = buildPlanner.structureData[key];
        }
    },

    TYPE: STRUCTURE_ROAD
};
