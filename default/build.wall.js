/* globals _, Game, Room, TOP, RIGHT, BOTTOM, LEFT, STRUCTURE_RAMPART */

let utils = require("utils");
let math = require("math");
let roadBuild = require("build.road");

/**
* Class to auto build walls
* @module build
* @class WallBuild
* @extends RoadBuild
*/

module.exports = _.merge({}, roadBuild, {
    initForCursorObject: function (buildPlanner, cursorObject) {
        // x, y - staring positions for check
        // dx, dy - x and y updates
        // dxp, dyp - positions for the wall relative to x & y
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

        let path = [], lastWall, paths = [], wallPath = [];
        for (let i = 0; i < 50; i++, x += dx, y += dy) {
            if (Game.map.getTerrainAt(x, y, buildPlanner.room.name) !== "wall") {
                if (path.length === 0) {
                    if (lastWall === undefined || i - lastWall >= 3) {
                        path.push({
                            x: x - 2 * dx + dxp,
                            y: y - 2 * dy + dyp,
                            dx: dxp,
                            dy: dyp,
                            direction: dirp
                        });
                    }
                    path.push({
                        x: x - 2 * dx + 2 * dxp,
                        y: y - 2 * dy + 2 * dyp,
                        dx: dxp,
                        dy: dyp,
                        direction: dirp
                    }, {
                        x: x - dx + 2 * dxp,
                        y: y - dy + 2 * dyp,
                        dx: dx,
                        dy: dy,
                        direction: dir
                    });
                }
                if (i - lastWall === 3) {
                    path.push({
                        x: x - 2 * dx + 2 * dxp,
                        y: y - 2 * dy + 2 * dyp,
                        dx: dx,
                        dy: dy,
                        direction: dir
                    }, {
                        x: x - dx + 2 * dxp,
                        y: y - dy + 2 * dyp,
                        dx: dx,
                        dy: dy,
                        direction: dir
                    });
                } else if (i - lastWall === 2) {
                    path.push({
                        x: x - dx + 2 * dxp,
                        y: y - dy + 2 * dyp,
                        dx: dx,
                        dy: dy,
                        direction: dir
                    });
                }
                path.push({
                    x: x + 2 * dxp,
                    y: y + 2 * dyp,
                    dx: dx,
                    dy: dy,
                    direction: dir
                });
                lastWall = i;
                this.addToWallPath(buildPlanner, wallPath, x + 3 * dxp, y + 3 * dyp);
            } else {
                if (path.length > 0 && ((lastWall !== undefined && i - lastWall === 3) || i === 49)) {
                    let diff = i - lastWall - 1;
                    path.push({
                        x: x - diff * dx + 2 * dxp,
                        y: y - diff * dy + 2 * dyp,
                        dx: dx,
                        dy: dy,
                        direction: dir
                    }, {
                        x: x - (diff - 1) * dx + 2 * dxp,
                        y: y - (diff - 1) * dy + 2 * dyp,
                        dx: dx,
                        dy: dy,
                        direction: dir
                    }, {
                        x: x - (diff - 1) * dx + dxp,
                        y: y - (diff - 1) * dy + dyp,
                        dx: -dxp,
                        dy: -dyp,
                        direction: _dirp
                    });
                    paths.push(Room.serializePath(path));
                    path = [];
                }
            }
        }
        this.addPathToCenter(buildPlanner, wallPath);
        return paths;
    },

    addToWallPath: function (buildPlanner, wallPath, x, y) {
        if (Game.map.getTerrainAt(x, y, buildPlanner.room.name) !== "wall") {
            if (wallPath.length === 0) {
                wallPath.push({
                    x, y,
                    dx: 0,
                    dy: -1,
                    direction: TOP
                });
            } else if (math.getDistanceBetweenPos(wallPath[wallPath.length - 1], {x, y}) === 1) {
                wallPath.push(math.getNextPathPos(wallPath[wallPath.length - 1], {x, y}));
            } else {
                //console.log(wallPath);
                console.log("findPath1:", wallPath[wallPath.length - 1].x, wallPath[wallPath.length - 1].y, x, y);
                wallPath.push(...buildPlanner.room.findPath(
                    new RoomPosition(
                        wallPath[wallPath.length - 1].x,
                        wallPath[wallPath.length - 1].y,
                        buildPlanner.room.name
                    ),
                    new RoomPosition(x, y, buildPlanner.room.name),
                    {
                        maxRooms: 1,
                        costCallback: () => {
                            return buildPlanner.costMatrix;
                        }
                    }
                ));
            }
        }
    },

    addPathToCenter: function (buildPlanner, path, exit) {
        let wallPathInfo = buildPlanner.room.pathManager.addPath(path)[0];
        buildPlanner.room.pathManager.wallPathIdxsByExit[exit] =
            buildPlanner.room.pathManager.wallPathIdxsByExit[exit] || [];
        buildPlanner.room.pathManager.wallPathIdxsByExit[exit].push(wallPathInfo.id);

        //console.log(wallPathInfo.path);
        console.log("findPath2:", buildPlanner.center, wallPathInfo.path[Math.round(wallPathInfo.path.length/2)]);
        let pathToWall = buildPlanner.room.findPath(
            buildPlanner.center,
            wallPathInfo.path[Math.round(wallPathInfo.path.length/2)],
            {
                maxRooms: 1,
                costCallback: () => {
                    return buildPlanner.costMatrix;
                }
            }
        );
        // add the source
        pathToWall.unshift({
            x: buildPlanner.center.x,
            y: buildPlanner.center.y,
            dx: 0,
            dy: -1,
            direction: TOP,
        });
        let pathToWallInfos = buildPlanner.room.pathManager.addPath(pathToWall, {
            [wallPathInfo.id]: {
                idx: wallPathInfo.id,
                pos: Math.round(wallPathInfo.path.length/2),
                targetPos: pathToWall.length - 1
            }
        });
        buildPlanner.room.pathManager.pathIdxsByExit[exit] =
            buildPlanner.room.pathManager.pathIdxsByExit[exit] || [];
        buildPlanner.room.pathManager.pathIdxsByExit[exit]
            .push(pathToWallInfos[pathToWallInfos.length - 1].id);
    },

    TYPE: STRUCTURE_RAMPART
});
