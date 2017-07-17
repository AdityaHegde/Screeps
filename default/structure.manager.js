let utils = require("utils");
let constants = require("constants");

utils.addMemorySupport(StructureContainer, "structures");
utils.addMemorySupport(StructureController, "structures");
utils.addMemorySupport(StructureExtension, "structures");
//utils.addMemorySupport(StructureTower, "structures");

utils.definePropertyInMemory(StructureContainer, "label", function() {
    return constants.HARVESTER_STORAGE;
});

utils.definePosPropertyInMemory(StructureController, "container");

utils.definePropertyInMemory(StructureExtension, "pathIdx");
utils.definePropertyInMemory(StructureExtension, "pathPos");
utils.definePropertyInMemory(StructureContainer, "pathIdx");
utils.definePropertyInMemory(StructureContainer, "pathPos");


StructureContainer.prototype.canStoreEnergy = function() {
    return this.store.energy < this.storeCapacity;
};

StructureTower.prototype.canStoreEnergy = function() {
    return this.energy < this.energyCapacity;
};

StructureSpawn.prototype.canStoreEnergy = function() {
    return this.energy < this.energyCapacity;
};

StructureExtension.prototype.canStoreEnergy = function() {
    return this.energy < this.energyCapacity;
};



StructureContainer.prototype.getRemainingEnergyCapacity = function() {
    return this.storeCapacity - this.store.energy;
};

StructureTower.prototype.getRemainingEnergyCapacity = function() {
    return this.energyCapacity - this.energy;
};

StructureSpawn.prototype.getRemainingEnergyCapacity = function() {
    return this.energyCapacity - this.energy;
};

StructureExtension.prototype.getRemainingEnergyCapacity = function() {
    return this.energyCapacity - this.energy;
};
