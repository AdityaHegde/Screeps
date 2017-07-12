let constants = require("constants");
let utils = require("utils");
let BaseBuild = require("build.base");

/**
* Class to auto build roads
* @module build
* @class RoadBuild
* @extends BaseBuild
*/

module.exports = BaseBuild.extend({
}, {
    TYPE : STRUCTURE_ROAD,
    BUILD_NAME : "road",
});
