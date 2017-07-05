var constants = require("constants");
var extensionBuilder = require("build.extension");

module.exports = _.assign({}, extensionBuilder, {
    type : STRUCTURE_CONTAINER,

    init : function(room) {
        let plannerInfo = {
            paths : [],
            labelMap : {},
            roadCursor : 0,
            pathCursor : 0,
        };

        for (let i = 0; i < room.tempRoadPaths.length; i++) {
            for (let j = room.tempRoadPaths[i].length - 2 - (i == 0 ? 2 : 0); j < room.tempRoadPaths[i].length; j++) {
                let dxdy = this.getDxDy(room.tempRoadPaths[i][j-1], room.tempRoadPaths[i][j]);
                if (this.checkAndAdd(room.tempRoadPaths[i][j].x - dxdy[0], room.tempRoadPaths[i][j].y - dxdy[1], room, plannerInfo.paths) ||
                    this.checkAndAdd(room.tempRoadPaths[i][j].x + dxdy[0], room.tempRoadPaths[i][j].y + dxdy[1], room, plannerInfo.paths)) {
                    break;
                }
            }
            //upgrader container
            if (i == 0) {
                plannerInfo.labelMap[plannerInfo.paths[i].join("__")] = constants.UPGRADER_STORAGE;
            }
        }

        return plannerInfo;
    },

    checkAndAdd : function(x, y, room, paths) {
        if(Game.map.getTerrainAt(x, y, room.name) != "wall") {
            //console.log(x, y);
            paths.push([x, y]);
            return true;
        }
        return false;
    },

    //build structures in positions
    //returns true if all structures are built for the current RCL, false if max sites has been reached
    build : function(room, plannerInfo) {
        //store the last built road block to resume later when max construction site has been reached
        var c = 0;
        if (plannerInfo.roadCursor == plannerInfo.paths.length) {
            //return true if this type of structure was finished before
            return true;
        }

        for (; plannerInfo.roadCursor < plannerInfo.paths.length; plannerInfo.roadCursor++) {
            var returnValue = room.createConstructionSite(plannerInfo.paths[plannerInfo.roadCursor][0], plannerInfo.paths[plannerInfo.roadCursor][1], this.type);
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

        //build only one type at a time
        return false;
    },
});
