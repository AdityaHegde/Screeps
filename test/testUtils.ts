import _ from "lodash";

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

const testUtils = {
  getPathFromDirections : function (...directions) {
    return directions.map((direction) => {
      return {
        direction : direction,
      };
    });
  },

  registerAllowables : function (mockery, ...allowables) {
    allowables.forEach((allowable) => {
      mockery.registerSubstitute(allowable, process.cwd() + "/default/" + allowable);
    });
  },

  deserializePath : function (path) {
    let result = [];
    let x,y, direction, dx, dy;

    x = parseInt(path.substring(0, 2));
    y = parseInt(path.substring(2, 4));

    let prevDirection;

    for (let i = 4; i < path.length; i++) {
      let directions = [];
      direction = parseInt(path.charAt(i));
      if (path.charAt(i) === "x") {
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

  visualize : function (maxX, maxY, ...paths) {
    let matrix = {};
    paths.forEach((path, idx) => {
      path.forEach((pos) => {
        matrix[pos.x] = matrix[pos.x] || {};
        matrix[pos.x][pos.y] = matrix[pos.x][pos.y] || [];
        matrix[pos.x][pos.y].push(idx);
      });
    });

    for (let j = 0; j < maxX; j++) {
      let str = "";
      for (let i = 0; i < maxY; i++) {
        let chars = (matrix[i] && matrix[i][j] ? matrix[i][j].join(",") : "X");
        str += chars;
        for (let k = 0; k < 4 - chars.length; k++) {
          str += " ";
        }
      }
      console.log(str);
    }
  },

  deserializeAndVisualize : function (maxX, maxY, ...paths) {
    this.visualize(maxX, maxY, ...paths.map(path => this.deserializePath(path)));
  },

  getPathInfo : function (path, math) {
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

  registerTerrainWalls : function (wallPaths, getTerrainAt) {
    wallPaths.forEach((wallPath) => {
      wallPath = this.deserializePath(wallPath);
      wallPath.forEach((wallPos) => {
        getTerrainAt.withArgs(wallPos.x, wallPos.y).returns("wall");
      });
    });
    getTerrainAt.returns("plain");
  },

  jsonify : function (instance) {
    let json;

    if (_.isArray(instance)) {
      json = _.map(instance, (element) => {
        return this.jsonify(element);
      });
    }
    else if (_.isObject(instance)) {
      json = {};
      _.forIn(instance, (value, key) => {
        let newValue = this.jsonify(value);
        if (newValue !== "__INVALID__") {
          json[key] = newValue;
        }
      });
    }
    else if (_.isFunction(instance)) {
      json = "__INVALID__";
    }
    else {
      json = instance;
    }

    return json;
  },

  correctJSON : function (json) {
    let correctedJson;

    if (_.isArray(json)) {
      correctedJson = _.map(json, (element) => {
        return this.correctJSON(element);
      });
    }
    else if (_.isObject(json)) {
      correctedJson = {};
      _.forIn(json, (value, key) => {
        let correctedKey = key.replace(/^_/, "");
        correctedJson[correctedKey] = this.correctJSON(value);
      });
    }
    else {
      correctedJson = json;
    }

    return correctedJson;
  },
};

export default testUtils;
