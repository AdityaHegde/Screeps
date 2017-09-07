let utils = require("utils");
let BaseClass = require("base.class");

let PathConnection = BaseClass("pathConnection", "pathsConnection");

utils.definePropertyInMemory(PathConnection, "idx", function () {
    return 0;
});

utils.definePropertyInMemory(PathConnection, "pos", function () {
    return 0;
});

utils.definePropertyInMemory(PathConnection, "targetPos", function () {
    return 0;
});

PathConnection.prototype.init = function (idx, pos, targetPos) {
    this.idx = idx;
    this.pos = pos;
    this.targetPos = targetPos;
    return this;
};

module.exports = PathConnection;
