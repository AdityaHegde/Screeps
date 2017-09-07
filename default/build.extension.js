/* globals _, Game, ERR_FULL, ERR_RCL_NOT_ENOUGH, STRUCTURE_EXTENSION */

let constants = require("constants");
let math = require("math");
let roadBuild = require("build.road");

/**
* Class to auto build extensions
* @module build
* @class ExtensionBuild
* @extends RoadBuild
*/

let ExtensionBuild = _.merge({}, roadBuild, {
    initForCursorObject: function (buildPlanner, pathInfo, idx, maxCount, curCount) {
        let points = [];
        let path = pathInfo.path;
        let parallelPath0 = pathInfo.parallelPath0;
        let parallelPath1 = pathInfo.parallelPath1;

        for (let i = 1, j = 0, k = 0; i < path.length - 4 && curCount + points.length < maxCount; i++) {
            if (j < parallelPath0.length) {
                this.checkAndAddToPoints(buildPlanner, points, parallelPath0[j], idx, i - 1,
                    math.getDirectionBetweenPos(path[i - 1], parallelPath0[j++]));
            }
            if (k < parallelPath1.length) {
                this.checkAndAddToPoints(buildPlanner, points, parallelPath1[k], idx, i - 1,
                    math.getDirectionBetweenPos(path[i - 1], parallelPath1[k++]));
            }

            if (path[i].direction !== path[i + 1].direction) {
                if (j < parallelPath0.length &&
                    (math.rotateDirection(path[i].direction, 1) === path[i + 1].direction ||
                    math.rotateDirection(path[i].direction, 2) === path[i + 1].direction)) {
                    this.checkAndAddToPoints(buildPlanner, points, parallelPath0[j], idx, i,
                        math.getDirectionBetweenPos(path[i], parallelPath0[j++]));
                } else if (k < parallelPath1.length &&
                    (math.rotateDirection(path[i].direction, -1) === path[i + 1].direction ||
                    math.rotateDirection(path[i].direction, -2) === path[i + 1].direction)) {
                    this.checkAndAddToPoints(buildPlanner, points, parallelPath1[k], idx, i,
                        math.getDirectionBetweenPos(path[i], parallelPath1[k++]));
                }
            }
        }

        if (curCount + points.length > maxCount) {
            return points.slice(0, maxCount - curCount);
        } else {
            return points;
        }
    },

    checkAndAddToPoints: function (buildPlanner, points, pos, idx, i, direction = undefined, label = undefined) {
        let point = this.checkAndAdd(buildPlanner, pos, idx, i, direction, label);
        if (point) {
            points.push(point);
        }
    },

    checkAndAdd: function (buildPlanner, pos, idx, i, direction = undefined, label = undefined) {
        if (Game.map.getTerrainAt(pos.x, pos.y, buildPlanner.room.name) !== "wall" &&
           buildPlanner.costMatrix.get(pos.x, pos.y) !== 255) {
            buildPlanner.structureData[pos.x + "__" + pos.y] = [idx, i];
            if (direction !== undefined) {
                buildPlanner.structureData[pos.x + "__" + pos.y][2] = direction;
            }
            if (label !== undefined) {
                buildPlanner.structureData[pos.x + "__" + pos.y][3] = label;
            }
            buildPlanner.costMatrix.set(pos.x, pos.y, 255);
            return pos.x + ":" + pos.y;
        }
        return null;
    },

    // build structures in positions
    // returns true if all structures are built for the current RCL, false if max sites has been reached
    build: function (buildPlanner) {
        // store the last built road block to resume later when max construction site has been reached
        let c = 0;
        if (buildPlanner.pathCursor === this.paths.length) {
            // return true if this type of structure was finished before
            return true;
        }

        for (; buildPlanner.pathCursor < this.paths.length; buildPlanner.pathCursor++) {
            let xy = this.paths[buildPlanner.pathCursor].split(":");
            let returnValue = this.buildAt(buildPlanner, xy[0], xy[1]);
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

        buildPlanner.room.fireEvents[constants.CONSTRUCTION_COMPLETED] = this.type;

        // build only one type at a time
        return false;
    },

    built: function (buildPlanner, structure) {
        let key = structure.pos.x + "__" + structure.pos.y;
        structure.pathData = [buildPlanner.structureData[key][0], buildPlanner.structureData[key][1]];
        if (buildPlanner.structureData[key][2]) {
            structure.pathData.push(buildPlanner.structureData[key][2]);
        }
        if (buildPlanner.structureData[key][3]) {
            structure.label = buildPlanner.structureData[key][3];
        }
        delete buildPlanner.structureData[key];
    },

    TYPE: STRUCTURE_EXTENSION
});

module.exports = ExtensionBuild;
