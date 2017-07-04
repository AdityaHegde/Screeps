var constants = require("constants");

module.exports = {
    type : STRUCTURE_ROAD,

    init : function(room) {
        let plannerInfo = {
            paths : [],
            roadCursor : 0,
            pathCursor : 0,
        };

        PathFinder.use();

        let spawn = Game.spawns[room.spawns[0]];
        let structures = [];
        structures.push(room.controller, ...room.find(FIND_SOURCES));

        room.tempRoadPaths = [];

        structures.forEach(function(target) {
            var roadPath = room.findPath(spawn.pos, target.pos, {
                ignoreCreeps : true,
                ignoreDestructibleStructures : true,
                ignoreRoads : true,
            });
            room.tempRoadPaths.push(roadPath);
            plannerInfo.paths.push(Room.serializePath(roadPath));
        });

        return plannerInfo;
    },

    //build structures in positions
    //returns true if all structures are built for the current RCL, false if max sites has been reached
    build : function(room, plannerInfo) {
        //store the last built road block to resume later when max construction site has been reached
        var c = 0;
        for (; plannerInfo.roadCursor < plannerInfo.paths.length; plannerInfo.roadCursor++) {
            var path = Room.deserializePath(plannerInfo.paths[plannerInfo.roadCursor]);

            for (; plannerInfo.pathCursor < path.length; plannerInfo.pathCursor++) {
                var returnValue = room.createConstructionSite(path[plannerInfo.pathCursor].x, path[plannerInfo.pathCursor].y, this.type);
                room.fireEvents[constants.CONSTRUCTION_SITE_ADDED] = 1;
                c++;
                //if max sites has been reached or if RCL is not high enough, return
                if (returnValue == ERR_FULL || returnValue == ERR_RCL_NOT_ENOUGH) {
                    //return true if RCL is not high enough, used to skip building a type for the current RCL
                    return returnValue == ERR_RCL_NOT_ENOUGH;
                }
                //limit the operations
                else if (c >= 5) {
                    return false;
                }
            }
            plannerInfo.pathCursor = 0;
        }

        room.fireEvents[constants.CONSTRUCTION_COMPLETED] = this.type;

        //build only one type at a time
        return false;
    },
};
