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
            case TOP: x = 0; y = 0; dx = 1; dy = 0; dir = RIGHT; dxp = 0; dyp = 1; dirp = BOTTOM; _dirp = TOP; break;
            case RIGHT: x = 49; y = 0; dx = 0; dy = 1; dir = BOTTOM; dxp = -1; dyp = 0; dirp = LEFT; _dirp = RIGHT; break;
            case BOTTOM: x = 49; y = 49; dx = -1; dy = 0; dir = LEFT; dxp = 0; dyp = -1; dirp = TOP; _dirp = BOTTOM; break;
            case LEFT: x = 0; y = 49; dx = 0; dy = -1; dir = TOP; dxp = 1; dyp = 0; dirp = RIGHT; _dirp = LEFT; break;
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
                    //console.log(i, x - 2 * dx + 2 * dxp, y - 2 * dy + 2 * dyp, x - dx + 2 * dxp, y - dy + 2 * dyp);
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
                    //console.log(i, lastWall, diff);
                    //console.log(x - diff * dx + 2 * dxp,       y - diff * dy + 2 * dyp);
                    //console.log(x - (diff - 1) * dx + 2 * dxp, y - (diff - 1) * dy + 2 * dyp);
                    //console.log(x - (diff - 1) * dx + dxp,     y - (diff - 1) * dy + dyp);
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
                    paths.push(Room.serializePath(path));
                    path = [];
                }
            }
        }
        return paths;
    },

    TYPE : STRUCTURE_RAMPART,
});
