let utils = require("utils");
let BaseClass = require("base.class");

let PathInfo = BaseClass("pathInfo", "pathsInfo");

utils.definePathPropertyInMemory(PathInfo, "path");

utils.definePathPropertyInMemory(PathInfo, "reverse");

utils.definePropertyInMemory(PathInfo, "creeps", function() {
    return [];
});

PathInfo.prototype.init = function(path) {
    this.path = path;
    this.reverse = utils.getReversedPath(path);
    return this;
};

module.exports = PathInfo;
