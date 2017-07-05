var utils = require("utils");
var constants = require("constants");

utils.addMemorySupport(StructureContainer.prototype, "structures");
//utils.addMemorySupport(StructureTower.prototype, "structures");

utils.definePropertyInMemory(StructureContainer.prototype, "label", function() {
    return constants.HARVESTER_STORAGE;
});
