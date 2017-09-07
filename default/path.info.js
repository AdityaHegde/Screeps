/* globals _ */

let utils = require("utils");
let math = require("math");
let BaseClass = require("base.class");
let PathConnection = require("path.connection");

let PathInfo = BaseClass("pathInfo", "pathsInfo");

utils.definePathPropertyInMemory(PathInfo, "path");

utils.definePathPropertyInMemory(PathInfo, "reverse");

utils.definePathPropertyInMemory(PathInfo, "parallelPath0");
utils.definePathPropertyInMemory(PathInfo, "parallelPath1");

// utils.definePropertyInMemory(PathInfo, "minX");
// utils.definePropertyInMemory(PathInfo, "minY");
// utils.definePropertyInMemory(PathInfo, "maxX");
// utils.definePropertyInMemory(PathInfo, "maxY");

utils.definePropertyInMemory(PathInfo, "creeps", function () {
    return {};
});

utils.defineInstanceMapPropertyInMemory(PathInfo, "connections", PathConnection);

utils.definePropertyInMemory(PathInfo, "directConnections", function () {
    return [];
});

PathInfo.prototype.init = function (path, findParallelPaths = false) {
    this.path = path;
    this.reverse = math.getReversedPath(path);
    if (findParallelPaths) {
        [this.parallelPath0, this.parallelPath1] = math.getParallelPaths(path);
    }

    // let minX = 99999, minY = 99999;
    // let maxX = 0, maxY = 0;
    // path.forEach((pos) => {
    //     if (pos.x < minX) {
    //         minX = pos.x;
    //     }
    //     if (pos.y < minY) {
    //         minY = pos.y;
    //     }
    //     if (pos.x > maxX) {
    //         maxX = pos.x;
    //     }
    //     if (pos.y > maxY) {
    //         maxY = pos.y;
    //     }
    // });
    // this.minX = minX;
    // this.minY = minY;
    // this.maxX = maxX;
    // this.maxY = maxY;

    return this;
};

PathInfo.prototype.populatePathsMatrix = function (pathsMatrix) {
    this.path.forEach((pos, i) => {
        let key = pos.x + "__" + pos.y;
        pathsMatrix[key] = pathsMatrix[key] || {};
        pathsMatrix[key][this.id] = i;
    });
};

PathInfo.prototype.addCreepToPos = function (creep, pos = creep.pathPos) {
    this.creeps[pos] = this.creeps[pos] || [];
    this.creeps[pos].push(creep.name);
};

PathInfo.prototype.removeCreepFromPos = function (creep, pos = creep.pathPos) {
    if (this.creeps[pos]) {
        _.pull(this.creeps[pos], creep.name);
        if (this.creeps[pos].length === 0) {
            delete this.creeps[pos];
        }
    }
};

module.exports = PathInfo;
