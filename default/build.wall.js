let utils = require("utils");
let constants = require("constants");
let roadBuild = require("build.road");

/**
* Class to auto build walls
* @module build
* @class WallBuild
* @extends RoadBuild
*/

module.exports = _.merge({}, roadBuild, {
    initForCursorObject : function(buildPlanner, cursorObject) {
        //x, y - staring positions for check
        //dx, dy - x and y updates
        //dxp, dyp - positions for the wall relative to x & y
        let x, y;
        let dx, dy, dir;
        let dxp, dyp, dirp, _dirp;
        let exit = Number(cursorObject);
        switch (exit) {
            case TOP:
                x = 0; y = 0; dx = 1; dy = 0; dir = RIGHT;
                dxp = 0; dyp = 1; dirp = BOTTOM; _dirp = TOP; break;
            case RIGHT:
                x = 49; y = 0; dx = 0; dy = 1; dir = BOTTOM;
                dxp = -1; dyp = 0; dirp = LEFT; _dirp = RIGHT; break;
            case BOTTOM:
                x = 49; y = 49; dx = -1; dy = 0; dir = LEFT;
                dxp = 0; dyp = -1; dirp = TOP; _dirp = BOTTOM; break;
            case LEFT:
                x = 0; y = 49; dx = 0; dy = -1; dir = TOP;
                dxp = 1; dyp = 0; dirp = RIGHT; _dirp = LEFT; break;
        }

        let path = [], lastWall, paths = [];
        for (let i = 0; i < 50; i++, x += dx, y += dy) {
            if (Game.map.getTerrainAt(x, y, buildPlanner.room.name) != "wall") {
                if (path.length == 0) {
                    if (lastWall == undefined || i - lastWall >= 3) {
                        path.push({
                            x : x - 2 * dx + dxp,
                            y : y - 2 * dy + dyp,
                            dx : dxp,
                            dy : dyp,
                            direction : dirp,
                        });
                    }
                    path.push({
                        x : x - 2 * dx + 2 * dxp,
                        y : y - 2 * dy + 2 * dyp,
                        dx : dxp,
                        dy : dyp,
                        direction : dirp,
                    }, {
                        x : x - dx + 2 * dxp,
                        y : y - dy + 2 * dyp,
                        dx : dx,
                        dy : dy,
                        direction : dir,
                    });
                }
                if (i - lastWall == 3) {
                    path.push({
                        x : x - 2 * dx + 2 * dxp,
                        y : y - 2 * dy + 2 * dyp,
                        dx : dx,
                        dy : dy,
                        direction : dir,
                    }, {
                        x : x - dx + 2 * dxp,
                        y : y - dy + 2 * dyp,
                        dx : dx,
                        dy : dy,
                        direction : dir,
                    });
                }
                else if (i - lastWall == 2) {
                    path.push({
                        x : x - dx + 2 * dxp,
                        y : y - dy + 2 * dyp,
                        dx : dx,
                        dy : dy,
                        direction : dir,
                    });
                }
                path.push({
                    x : x + 2 * dxp,
                    y : y + 2 * dyp,
                    dx : dx,
                    dy : dy,
                    direction : dir,
                });
                lastWall = i;
            }
            else {
                if (path.length > 0 && ((lastWall != undefined && i - lastWall == 3) || i == 49)) {
                    let diff = i - lastWall - 1;
                    path.push({
                        x : x - diff * dx + 2 * dxp,
                        y : y - diff * dy + 2 * dyp,
                        dx : dx,
                        dy : dy,
                        direction : dir,
                    }, {
                        x : x - (diff - 1) * dx + 2 * dxp,
                        y : y - (diff - 1) * dy + 2 * dyp,
                        dx : dx,
                        dy : dy,
                        direction : dir,
                    }, {
                        x : x - (diff - 1) * dx + dxp,
                        y : y - (diff - 1) * dy + dyp,
                        dx : -dxp,
                        dy : -dyp,
                        direction : _dirp,
                    });
                    this.addPathToCenter(buildPlanner, path);
                    paths.push(Room.serializePath(path));
                    path = [];
                }
            }
        }
        return paths;
    },

    addPathToCenter : function(buildPlanner, path) {
        let edges = [0, 1, 2].map((idx) => {
            let pos0 = buildPlanner.room.pathManager.pathsInfo[idx].path[buildPlanner.room.pathManager.pathsInfo[idx].path.length - 1];
            let pos1 = {};
            let pathPos, pathPosOnWall;
            if (pos0.x >= path[0].x && pos0.x <= path[path.length - 1].x) {
                pos1.x = pos0.x;
                for (let i = 0; i < path.length; i++) {
                    if (path[i].x == pos0.x) {
                        pathPosOnWall = i;
                        break;
                    }
                }
            }
            else if (pos0.x <= path[0].x) {
                pos1.x = path[0].x;
                pathPos = 0;
            }
            else {
                pos1.x = path[path.length - 1].x;
                pathPos = path.length - 1;
            }

            if (pos0.y >= path[0].y && pos0.y <= path[path.length - 1].y) {
                pos1.y = pos0.y;
                for (let i = 0; i < path.length; i++) {
                    if (path[i].y == pos0.y) {
                        pathPosOnWall = i;
                        break;
                    }
                }
            }
            else if (pos0.y <= path[0].y) {
                pos1.y = path[0].y;
                pathPos = 0;
            }
            else {
                pos1.y = path[path.length - 1].y;
                pathPos = path.length - 1;
            }

            return {
                pos0 : pos0,
                pos1 : pos1,
                idx : idx,
                fromPos : buildPlanner.room.pathManager.pathsInfo[idx].path.length - 1,
                toPos : pathPos,
                toWallPathPos : pathPosOnWall,
            };
        });
        let closest = utils.getClosestEdge(edges);
        let pathToWall = buildPlanner.room.findPath(closest.pos0, closest.pos1, {
            maxRooms : 1,
            costCallback : () => {
                return buildPlanner.costMatrix;
            },
        });
        let pathToWallIdx = buildPlanner.room.pathManager.addPath(pathToWall, {
            [closest.idx] : {
                fromPos : closest.fromPos,
                toPos : 0,
            },
        });
        buildPlanner.room.pathManager.addPath(path, {
            [pathToWallIdx] : {
                fromPos : pathToWall.length - 1,
                toPos : closest.toWallPathPos,
            },
        });
    },

    TYPE : STRUCTURE_RAMPART,
});
