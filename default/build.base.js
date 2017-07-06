let constants = require("constants");
let utils = require("utils");
let BaseClass = require("base.class");

/**
* Base class for auto build
* @module build
* @class BaseBuild
* @extends BaseClass
*/

let BaseBuild = BaseClass("build");

BaseBuild.TYPE = 0;
BaseBuild.EVENT_LISTENERS = [];
BaseBuild.BUILD_NAME = "":

BaseBuild.init = function() {
    this.EVENT_LISTENERS.forEach((eventListener) => {
        eventBus.subscribe(eventListener.eventName, this.prototype[eventListener.method], "this." + this.BUILD_NAME);
    });
};

BaseBuild.__staticMembers = ["TYPE", "EVENT_LISTENERS", "BUILD_NAME", "init"];

utils.definePropertyInMemory(BaseBuild.prototype, "paths", function() {
    return [];
});

utils.definePropertyInMemory(BaseBuild.prototype, "roadCursor", function() {
    return 0;
});

utils.definePropertyInMemory(BaseBuild.prototype, "pathCursor", function() {
    return 0;
});

utils.defineInstancePropertyByNameInMemory(BaseRole.property, "room", "rooms");

BaseBuild.prototype.init = function(room) {
    this.room = room;
    PathFinder.use();

    let spawn = Game.spawns[this.room.spawns[0]];
    let structures = [];
    structures.push(this.room.controller, ...this.room.sources.map(source => Game.getObjectById(source)));
    //structures.push(this.room.controller, ...this.room.find(FIND_SOURCES));

    this.room.tempRoadPaths = [];

    structures.forEach((target) => {
        let roadPath = this.room.findPath(spawn.pos, target.pos, {
            ignoreCreeps : true,
            ignoreDestructibleStructures : true,
            ignoreRoads : true,
        });
        this.room.tempRoadPaths.push(roadPath);
        this.paths.push(Room.serializePath(roadPath));
    });
};

//build structures in positions
//returns true if all structures are built for the current RCL, false if max sites has been reached
BaseBuild.prototype.build = function() {
    //store the last built road block to resume later when max construction site has been reached
    let c = 0;
    if (this.roadCursor == this.paths.length) {
        //return true if this type of structure was finished before
        return true;
    }

    for (; this.roadCursor < this.paths.length; this.roadCursor++) {
        let path = Room.deserializePath(this.paths[this.roadCursor]);

        for (; this.pathCursor < path.length; this.pathCursor++) {
            let returnValue = this.room.createConstructionSite(path[this.pathCursor].x, path[this.pathCursor].y,
                                                               this.constructor.TYPE);
            this.room.fireEvents[constants.CONSTRUCTION_SITE_ADDED] = 1;
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
        this.pathCursor = 0;
    }

    this.room.fireEvents[constants.CONSTRUCTION_COMPLETED] = this.type;

    //build only one type at a time
    return false;
};

module.exports = BaseBuild;
