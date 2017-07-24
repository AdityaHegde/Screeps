let DIRECTION_TO_OFFSET = {
    [TOP]          : [0,-1],
    [TOP_RIGHT]    : [1,-1],
    [RIGHT]        : [1,0],
    [BOTTOM_RIGHT] : [1,1],
    [BOTTOM]       : [0,1],
    [BOTTOM_LEFT]  : [-1,1],
    [LEFT]         : [-1,0],
    [TOP_LEFT]     : [-1,-1]
};
let OFFSET_TO_DIRECTION = {
    "0__-1"  : TOP,
    "1__-1"  : TOP_RIGHT,
    "1__0"   : RIGHT,
    "1__1"   : BOTTOM_RIGHT,
    "0__1"   : BOTTOM,
    "-1__1"  : BOTTOM_LEFT,
    "-1__0"  : LEFT,
    "-1__-1" : TOP_LEFT,
};
let DIRECTION_TO_PARALLEL_OFFSET = {
    [TOP]          : [-1, 0, 1, 0],
    [TOP_RIGHT]    : [0, -1, 1, 0],
    [RIGHT]        : [0, -1, 0, 1],
    [BOTTOM_RIGHT] : [1, 0, 0, 1],
    [BOTTOM]       : [1, 0, -1, 0],
    [BOTTOM_LEFT]  : [0, 1, -1, 0],
    [LEFT]         : [0, 1, 0, -1],
    [TOP_LEFT]     : [-1, 0, 0, -1],
};

module.exports = {
    getParallelPaths : function(path) {
        let path0 = [], path1 = [];
        let matrix = {};
        for (let i = 1; i < path.length; i++) {
            let [dx0, dy0, dx1, dy1] = DIRECTION_TO_PARALLEL_OFFSET[path[i].direction];
            this.addPosToPath(path0, matrix, path[i-1], path[i+1], dx0, dy0);
            this.addPosToPath(path1, matrix, path[i-1], path[i+1], dx1, dy1);
            if (i < path.length - 1 && path[i].direction != path[i+1].direction) {
                if (this.rotateDirection(path[i].direction, 1) == path[i+1].direction ||
                    this.rotateDirection(path[i].direction, 2) == path[i+1].direction) {
                    this.addPosToPath(path0, matrix, path[i], path[i+1], dx0, dy0);
                }
                else if (this.rotateDirection(path[i].direction, -1) == path[i+1].direction ||
                         this.rotateDirection(path[i].direction, -2) == path[i+1].direction) {
                    this.addPosToPath(path1, matrix, path[i], path[i+1], dx1, dy1);
                }
            }
            matrix[path[i].x + "__" + path[i].y] = 1;
        }

        return [path0, path1];
    },

    addPosToPath : function(path, matrix, pos0, pos1, dx, dy) {
        let pos = {
            x : pos0.x + dx,
            y : pos0.y + dy,
        };
        if (!matrix[pos.x + "__" + pos.y] &&
            (!pos1 || !this.posEquals(pos1, pos))) {
            path.push(pos);
            matrix[pos.x + "__" + pos.y] = 1;
        }
    },

    posEquals : function(pos0, pos1) {
        return pos0.x == pos1.x && pos0.y == pos1.y;
    },

    getCentroid : function(points) {
        let x = 0, y = 0;
        points.forEach((point) => {
            x += point.x;
            y += point.y;
        });
        return {
            x : Math.round(x/points.length),
            y : Math.round(y/points.length),
        };
    },

    getOffsetByDirection : function(direction) {
        return DIRECTION_TO_OFFSET[direction];
    },

    rotateDirection : function(direction, times) {
        let newDirection = ((direction + times - 1) % 8) + 1;
        return newDirection < 0 ? 8 + newDirection : newDirection;
    },

    sortPositionsByDirection : function(positions) {
        positions = positions.sort(function(a, b) {
            return a.direction - b.direction;
        });
        for (let i = 1; i < positions.length; i++) {
            if (this.rotateDirection(positions[i-1].direction, 1) != positions[i].direction) {
                positions = [...positions.slice(i), ...positions.slice(0, i)];
                break;
            }
        }

        return positions;
    },

    getReversedPath : function(path) {
        return path.map((pos) => {
            return {
                x : pos.x,
                y : pos.y,
                dx : -pos.dx,
                dy : -pos.dy,
                direction : this.rotateDirection(pos.direction, 4),
            };
        });
    },

    getPosByDirection : function(pos, direction, distance = 1) {
        let offset = this.getOffsetByDirection(direction);
        return new RoomPosition(pos.x + distance * offset[0], pos.y + distance * offset[1], pos.roomName);
    },

    getPathFromPoints : function(points) {
        let path = [{
            x : points[0].x,
            y : points[0].y,
            dx : 0,
            dy : -1,
            direction : TOP,
        }];
        for (let i = 1; i < points.length; i++) {
            let dx = points[i].x - points[i-1].x;
            let dy = points[i].y - points[i-1].y;
            path.push({
                x : points[i].x,
                y : points[i].y,
                dx : dx,
                dy : dy,
                direction : OFFSET_TO_DIRECTION[dx + "__" + dy],
            });
        }
        return path;
    },

    getDirectionBetweenPos : function(pos0, pos1) {
        let dx = pos1.dx - pos0.dx;
        dx = dx > 1 ? 1 : (dx < -1 ? -1 : dx);
        let dy = pos1.dy - pos0.dy;
        dy = dy > 1 ? 1 : (dy < -1 ? -1 : dy);
        return OFFSET_TO_DIRECTION[dx + "__" + dy];
    },

    getDistanceBetweenPos : function(pos0, pos1) {
        return Math.sqrt((pos0.x - pos1.x) * (pos0.x - pos1.x) + (pos0.y - pos1.y) * (pos0.y - pos1.y));
    },
};
