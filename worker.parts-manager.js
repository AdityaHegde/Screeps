var WORKER_PARTS = [WORK, CARRY, MOVE];
var BUFFER_ENERGY = 100;
var ENERGY_BY_PART = {};
ENERGY_BY_PART[WORK] =  100;
ENERGY_BY_PART[CARRY] = 50;
ENERGY_BY_PART[MOVE] = 50;

module.exports = {
    initSpawn : function(spawn) {
        spawn.memory.partManager = {
            parts : WORKER_PARTS.slice(),
            partsCost : 200,
            i : 0,
        };
    },

    tick : function(spawn) {
        var newPart;
        if (spawn.memory.partManager.parts.length % 2 == 1) {
            //if the parts is odd, then add a MOVE
            newPart = MOVE;
        }
        else {
            //else add WORK or CARRY alternatively
            newPart = WORKER_PARTS[spawn.memory.partManager.i];
        }
        //if the available energy capacity can accommodate the new part with a buffer
        //TODO scale buffer
        if (spawn.room.energyCapacityAvailable > spawn.memory.partManager.partsCost + ENERGY_BY_PART[newPart] + BUFFER_ENERGY) {
            spawn.memory.partManager.parts.push(newPart);
            spawn.memory.partManager.partsCost += ENERGY_BY_PART[newPart];
            if (newPart != MOVE) {
                spawn.memory.partManager.i++;
            }
        }
    },
};
