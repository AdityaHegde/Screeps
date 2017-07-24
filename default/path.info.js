let utils = require("utils");
let math = require("math");
let BaseClass = require("base.class");
let PathConnection = require("path.connection");

let PathInfo = BaseClass("pathInfo", "pathsInfo");

utils.definePathPropertyInMemory(PathInfo, "path");

utils.definePathPropertyInMemory(PathInfo, "reverse");

utils.definePathPropertyInMemory(PathInfo, "parallelPath0");
utils.definePathPropertyInMemory(PathInfo, "parallelPath1");

utils.definePropertyInMemory(PathInfo, "creeps", function() {
    return {};
});

utils.defineInstanceMapPropertyInMemory(PathInfo, "connections", PathConnection);

utils.definePropertyInMemory(PathInfo, "directConnections", function() {
    return [];
});

PathInfo.prototype.init = function(path, findParallelPaths = false) {
    this.path = path;
    this.reverse = math.getReversedPath(path);
    if (findParallelPaths) {
        [this.parallelPath0, this.parallelPath1] = math.getParallelPaths(path);
    }
    return this;
};

PathInfo.prototype.addCreepToPos = function(creep, pos = creep.pathPos) {
    this.creeps[pos] = this.creeps[pos] || [];
    this.creeps[pos].push(creep.name);
}

PathInfo.prototype.removeCreepFromPos = function(creep, pos = creep.pathPos) {
    if (this.creeps[pos]) {
        _.pull(this.creeps[pos], creep.name);
        if (this.creeps[pos].length == 0) {
            delete this.creeps[pos];
        }
    }
};

module.exports = PathInfo;
