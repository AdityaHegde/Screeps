let OFFSETS_BY_DIRECTION = {
    1: [0,-1],
    2: [1,-1],
    3: [1,0],
    4: [1,1],
    5: [0,1],
    6: [-1,1],
    7: [-1,0],
    8: [-1,-1],
};

module.exports = {
    getPathFromDirections : function(...directions) {
        return directions.map((direction) => {
            return {
                direction : direction,
            };
        });
    },

    registerAllowables : function(mockery, ...allowables) {
        allowables.forEach((allowable) => {
            mockery.registerSubstitute(allowable, process.cwd() + "/default/" + allowable);
        });
    },

    deserializePath : function(path) {
        let result = [];
        let x,y, direction, dx, dy;

        x = parseInt(path.substring(0, 2));
        y = parseInt(path.substring(2, 4));

        let prevDirection;

        for (let i = 4; i < path.length; i++) {
            let directions = [];
            direction = parseInt(path.charAt(i));
            if (path.charAt(i) == "x") {
                for (let j = 0; j < Number(path.charAt(i+1)) - 1; j++) {
                    directions.push(prevDirection);
                }
                i++;
            }
            else {
                directions = [direction];
                prevDirection = direction;
            }
            directions.forEach((direction) => {
                dx = OFFSETS_BY_DIRECTION[direction][0];
                dy = OFFSETS_BY_DIRECTION[direction][1];
                if (i > 4) {
                    x += dx;
                    y += dy;
                }
                result.push({
                    x, y,
                    dx, dy,
                    direction
                });
            })
        }

        return result;
    },

    visualize : function(...paths) {
        let matrix = {};
        paths.forEach((path, idx) => {
            path.forEach((pos) => {
                matrix[pos.x] = matrix[pos.x] || {};
                matrix[pos.x][pos.y] = matrix[pos.x][pos.y] || [];
                matrix[pos.x][pos.y].push(idx+1);
            });
        });

        for (let j = 0; j < 20; j++) {
            let str = "";
            for (let i = 0; i < 20; i++) {
                let chars = (matrix[i] && matrix[i][j] ? matrix[i][j].join(",") : "0");
                str += chars;
                for (let k = 0; k < 4 - chars.length; k++) {
                    str += " ";
                }
            }
            console.log(str);
        }
    },

    getPathInfo : function(path, math) {
        path = this.deserializePath(path);
        let parallelPaths = math.getParallelPaths(path);
        return {
            path : path,
            reverse : math.getReversedPath(path),
            parallelPath0 : parallelPaths[0],
            parallelPath1 : parallelPaths[1],
            memory : {
                path : path,
            },
        };
    },

    registerTerrainWalls : function(wallPaths, getTerrainAt) {
        wallPaths.forEach((wallPath) => {
            wallPath = this.deserializePath(wallPath);
            wallPath.forEach((wallPos) => {
                getTerrainAt.withArgs(wallPos.x, wallPos.y).returns("wall");
            });
        })
    },
};
