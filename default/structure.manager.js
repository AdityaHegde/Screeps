/* globals _, ConstructionSite, StructureContainer, StructureController, StructureExtension, StructureExtractor, StructureLab, StructureLink, StructureNuker, StructurePowerSpawn, StructureRampart, StructureRoad, StructureSpawn, StructureStorage, StructureTerminal, StructureTower, StructureWall, Source */

let utils = require("utils");
let constants = require("constants");

utils.definePropertyInMemory(StructureContainer, "label", function () {
    return constants.HARVESTER_STORAGE;
});

// prototype from parent Structure is extracted before this code is executed.
// we have to define this on every strcuture
[ConstructionSite, StructureContainer, StructureController, StructureExtension, StructureExtractor, StructureLab, StructureLink, StructureNuker, StructurePowerSpawn, StructureRampart, StructureRoad, StructureSpawn, StructureStorage, StructureTerminal, StructureTower, StructureWall, Source].forEach((StructureClass) => {
    if (!StructureClass.prototype.memory) {
        utils.addMemorySupport(StructureClass, "structures");
    }

    utils.definePropertyInMemory(StructureClass, "pathData", null, function (value) {
        return value.join(":");
    }, function (value) {
        return value.split(":");
    });
    utils.definePropertyInCache(StructureClass, "pathIdx", function () {
        return this.pathData[0];
    });
    utils.definePropertyInCache(StructureClass, "pathPos", function () {
        return this.pathData[1];
    });
    utils.definePropertyInCache(StructureClass, "direction", function () {
        return this.pathData[2];
    });

    if (!StructureClass.property.getPathIdxPathPos) {
        StructureClass.property.getPathIdxPathPos = function (creep) {
            return this.pathData;
        };
    }
});

[StructureContainer, StructureStorage, StructureTerminal].forEach((StructureClass) => {
    StructureContainer.prototype.canStore = function () {
        return _.sum(this.store) < this.storeCapacity;
    };

    StructureContainer.prototype.getRemainingCapacity = function () {
        return this.storeCapacity - _.sum(this.store);
    };
});

[StructureExtension, StructureLab, StructureLink, StructureNuker, StructureSpawn, StructureTower].forEach((StructureClass) => {
    StructureTower.prototype.canStore = function (type = "energy") {
        return this[type] < this[type + "Capacity"];
    };

    StructureTower.prototype.getRemainingCapacity = function (type = "energy") {
        return this[type + "Capacity"] - this[type];
    };
});

// used to generaize canStore and getRemainingCapacity
utils.definePropertyInCache(StructureLab, "mineral", "mineralAmount");
