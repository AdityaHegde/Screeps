module.exports = {
    type : STRUCTURE_ROAD,

    initSpawn : function(spawn) {
        let costs = new PathFinder.CostMatrix;

        PathFinder.use();

        spawn.memory.basePlanner[this.type] = {
            paths : [],
            roadCursor : 0,
            pathCursor : 0,
            pathPartCurosr : 0,
        };

        let visual = new RoomVisual(spawn.room.name);

        _.concat(spawn.room.find(FIND_SOURCES), spawn.room.controller).forEach(function(target) {
            var roadPath = spawn.room.findPath(spawn.pos, target.pos, {
                ignoreCreeps : true,
                ignoreDestructibleStructures : true,
                ignoreRoads : true,
                serialize : true,
            });
            spawn.memory.basePlanner.road.roadPaths.push(roadPath);
            visual.poly(roadPath, {
                lineStyle : "dotted",
                color : "white",
            });
        });
    },

    //build structures in positions
    //returns true if all structures are built for the current RCL, false if max sites has been reached
    build : function(spawn) {
        var data = spawn.memory.basePlanner[this.type];
        //store the last built road block to resume later when max construction site has been reached
        var i, j;
        for (i = data.roadCursor; i < data.roadPaths.length; i++) {
            var path = Room.deserializePath(data.roadPaths[i]);

            for (j = data.pathCursor; j < path.length - 1; j++) {
                for (var k = data.pathPartCurosr; path[j].x < path[j+1].x || path[j].y < path[j+1].y; k++) {
                    var returnValue = spawn.room.createConstructionSite(path[j].x * path[j+1].dx * k, path[j].y * path[j+1].dy * k, this.type);
                    //if max sites has been reached or if RCL is not high enough, return
                    if (returnValue == ERR_FULL || returnValue == ERR_RCL_NOT_ENOUGH) {
                        data.roadCursor = i;
                        //return true if RCL is not high enough, used to skip building a type for the current RCL
                        return returnValue == ERR_RCL_NOT_ENOUGH;
                    }
                }
                data.pathPartCurosr = 0;
            }

            data.pathCursor = 0;
        }
        data.roadCursor = i;

        return true;
    },
};
