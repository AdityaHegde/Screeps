let constants = require("constants");
let utils = require("utils");
let ExtensionBuild = require("build.extension");

/**
* Class to auto build walls
* @module build
* @class ContainerBuild
* @extends ExtensionBuild
*/

let ContainerBuild = ExtensionBuild.extend({
    getCursorObjects : function(buildPlanner) {
        return buildPlanner.buildInfo.road.paths.slice(0, buildPlanner.room.sourceManager.sources.length + 1);
    },

    initForCursorObject : function(buildPlanner, cursorObject, i) {
        let path = Room.deserializePath(buildPlanner.buildInfo.road.paths[i]);
        if (i == 0) {
            this.checkAndAdd(buildPlanner.room, path[path.length - 4].x, path[path.length - 4].y);
            this.labelMap[this.paths[i].join("__")] = constants.UPGRADER_STORAGE;
        }
        else {
            this.checkAndAdd(buildPlanner.room, path[path.length - 2].x, path[path.length - 2].y);
        }
    },

    checkAndAdd : function(room, x, y) {
        if(Game.map.getTerrainAt(x, y, room.name) != "wall") {
            this.paths.push([x, y]);
            return true;
        }
        return false;
    },

    //build structures in positions
    //returns true if all structures are built for the current RCL, false if max sites has been reached
    build : function(buildPlanner) {
        //store the last built road block to resume later when max construction site has been reached
        let c = 0;
        if (this.cursor == this.paths.length) {
            //return true if this type of structure was finished before
            return true;
        }

        for (; this.cursor < this.paths.length; this.cursor++) {
            let returnValue = this.buildAt(buildPlanner, this.paths[this.cursor][0], this.paths[this.cursor][1]);
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

        buildPlanner.room.fireEvents[constants.CONSTRUCTION_COMPLETED] = this.type;

        //build only one type at a time
        return false;
    },

    containerBuilt : function(containers) {
        containers.forEach((container) => {
            if (this.labelMap[container.pos.x + "__" + container.pos.y]) {
                container.label = this.labelMap[container.pos.x + "__" + container.pos.y];
            }
        });
    },
}, {
    EVENT_LISTENERS : [{
        eventName : constants.CONTAINER_BUILT,
        method : "containerBuilt",
    }],
    TYPE : STRUCTURE_CONTAINER,
    BUILD_NAME : "container",
});

utils.definePropertyInMemory(ContainerBuild, "labelMap", function() {
    return {};
});

module.exports = ContainerBuild;
