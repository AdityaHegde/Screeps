module.exports = {
    type : STRUCTURE_ROAD,

    init : function(room) {
        let plannerInfo = {
            paths : [],
            roadCursor : 0,
            pathCursor : 0,
            pathPartCurosr : 0,
        };

        PathFinder.use();

        let visual = new RoomVisual(room.name);
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
            visual.poly(roadPath, {
                lineStyle : "dotted",
                color : "white",
            });
        });

        return plannerInfo;
    },

    //build structures in positions
    //returns true if all structures are built for the current RCL, false if max sites has been reached
    build : function(room, plannerInfo) {
        //store the last built road block to resume later when max construction site has been reached
        var i, j;
        for (i = plannerInfo.roadCursor; i < plannerInfo.roadPaths.length; i++) {
            var path = Room.deserializePath(plannerInfo.roadPaths[i]);

            for (j = plannerInfo.pathCursor; j < path.length - 1; j++) {
                for (var k = plannerInfo.pathPartCurosr; path[j].x < path[j+1].x || path[j].y < path[j+1].y; k++) {
                    var returnValue = room.createConstructionSite(path[j].x * path[j+1].dx * k, path[j].y * path[j+1].dy * k, this.type);
                    //if max sites has been reached or if RCL is not high enough, return
                    if (returnValue == ERR_FULL || returnValue == ERR_RCL_NOT_ENOUGH) {
                        plannerInfo.roadCursor = i;
                        //return true if RCL is not high enough, used to skip building a type for the current RCL
                        return returnValue == ERR_RCL_NOT_ENOUGH;
                    }
                }
                plannerInfo.pathPartCurosr = 0;
            }

            plannerInfo.pathCursor = 0;
        }
        plannerInfo.roadCursor = i;

        return true;
    },
};
