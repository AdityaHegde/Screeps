var WORKER_PARTS = [WORK, CARRY, MOVE];
var ENERGY_BY_PART = {};
ENERGY_BY_PART[WORK] =  100;
ENERGY_BY_PART[CARRY] = 50;
ENERGY_BY_PART[MOVE] = 50;

module.exports = {
    initSpawn : function(spawn) {
        spawn.memory.partsManager = {
            parts : WORKER_PARTS.slice(),
            partsCost : 250,
            i : 0,
        };
        spawn.memory.partsManager.parts.push(MOVE);
    },

    tick : function(spawn) {
        var newPart = WORKER_PARTS[spawn.memory.partsManager.i];

        //if the available energy capacity can accommodate the new part
        if (spawn.room.energyCapacityAvailable >= spawn.memory.partsManager.partsCost + ENERGY_BY_PART[newPart] + ENERGY_BY_PART[MOVE]) {
            spawn.memory.partsManager.parts.push(newPart, MOVE);
            spawn.memory.partsManager.parts = spawn.memory.partsManager.parts.sort();
            spawn.memory.partsManager.partsCost += ENERGY_BY_PART[newPart] + ENERGY_BY_PART[MOVE];
            spawn.memory.partsManager.i = spawn.memory.partsManager.i == 0 ? 1 : 0;

            console.log("Upgraded the creeps parts to", spawn.memory.partsManager.parts.join(","));
        }
    },
};
