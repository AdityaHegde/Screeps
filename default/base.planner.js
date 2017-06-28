var STRUCTURE_TYPES = [{
    name : "road",
    api : require("base.build.road"),
}, {
    name : "extension",
    api : require("base.build.extension"),
}];

module.exports = {
    initSpawn : function(spawn) {
        spawn.memory.basePlanner = {
            lastLevel : spawn.controller.level,
            cursor : STRUCTURE_TYPES.length,
        };
        STRUCTURE_TYPES.forEach(function(structure) {
            structure.api.initSpawn(spawn);
        });
    },

    tick : function(spawn) {
        //check if RCL changed or some structures are yet to be built for current RCL
        if (spawn.controller.level > spawn.memory.basePlanner.lastLevel || spawn.memory.basePlanner.cursor < STRUCTURE_TYPES.length) {
            //reset the cursor when executed for the 1st time RCL changed
            if (spawn.memory.basePlanner.cursor == STRUCTURE_TYPES.length) {
                spawn.memory.basePlanner.cursor = 0;
            }

            for (; spawn.memory.basePlanner.cursor < STRUCTURE_TYPES.length; spawn.memory.basePlanner.cursor++) {
                //if the structure is yet to be finished, break
                if (!STRUCTURE_TYPES[spawn.memory.basePlanner.cursor].api.build(spawn)) {
                    break;
                }
            }
        }
        spawn.memory.basePlanner.lastLevel = spawn.controller.level;
    },
};
