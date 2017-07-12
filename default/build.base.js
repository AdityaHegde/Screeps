let constants = require("constants");
let utils = require("utils");
let BaseClass = require("base.class");
let eventBus = require("event.bus");

/**
* Base class for auto build
* @module build
* @class BaseBuild
* @extends BaseClass
*/

let BaseBuild = BaseClass("build");

BaseBuild.TYPE = 0;
BaseBuild.EVENT_LISTENERS = [];
BaseBuild.BUILD_NAME = "";

BaseBuild.init = function() {
    this.EVENT_LISTENERS.forEach((eventListener) => {
        eventBus.subscribe(eventListener.eventName, eventListener.method, "buildPlanner.buildInfo." + this.BUILD_NAME);
    });
};

BaseBuild.__staticMembers = {
    "TYPE" : 1,
    "EVENT_LISTENERS" : 1,
    "BUILD_NAME" : 1,
    "init" : 1,
};

utils.definePropertyInMemory(BaseBuild, "paths", function() {
    return [];
});

utils.definePropertyInMemory(BaseBuild, "cursor", function() {
    return 0;
});

utils.definePropertyInMemory(BaseBuild, "subCursor", function() {
    return 0;
});

BaseBuild.prototype.init = function(buildPlanner) {
    let cursorObjects = this.getCursorObjects(buildPlanner);
    this.initForCursorObject(buildPlanner, cursorObjects[this.cursor], this.cursor++);

    if (this.cursor == cursorObjects.length) {
        this.cursor = 0;
        return true;
    }
    return false;
};

BaseBuild.prototype.getCursorObjects = function(buildPlanner) {
    let spawn = Game.spawns[buildPlanner.room.spawns[0]];
    let centerPos = new RoomPosition(buildPlanner.center.x, buildPlanner.center.y, buildPlanner.room.name);
    let cursorObjects = [{
        source : centerPos,
        target : buildPlanner.room.controller.pos,
        range : 3,
    }];
    cursorObjects.push(...buildPlanner.room.sources.map((energySource) => {
        return {
            source : centerPos,
            target : energySource.pos,
            range : 0,
        };
    }));
    cursorObjects.push(...buildPlanner.room.sources.map((energySource) => {
        return {
            source : energySource.pos,
            target : buildPlanner.room.controller.pos,
            range : 0,
        };
    }));
    return cursorObjects;
};

BaseBuild.prototype.initForCursorObject = function(buildPlanner, cursorObject) {
    let path = buildPlanner.room.findPath(cursorObject.source, cursorObject.target, {
        maxRooms : 1,
        costCallback : () => {
            return buildPlanner.costMatrix;
        },
    });

    //set the caclulated path to the cost matrix
    for (let i = 1; i < path.length; i++) {
        buildPlanner.costMatrix.set(path[i].x, path[i].y, 1);
    }

    this.paths.push(Room.serializePath(path));
};

//build structures in positions
//returns true if all structures are built for the current RCL, false if max sites has been reached
BaseBuild.prototype.build = function(buildPlanner) {
    //store the last built road block to resume later when max construction site has been reached
    let c = 0;
    if (this.cursor == this.paths.length) {
        //return true if this type of structure was finished before
        return true;
    }

    for (; this.cursor < this.paths.length; this.cursor++) {
        let path = Room.deserializePath(this.paths[this.cursor]);

        for (; this.subCursor < path.length; this.subCursor++) {
            let returnValue = this.buildAt(buildPlanner, path[this.subCursor].x, path[this.subCursor].y);
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
        this.subCursor = 0;
    }

    buildPlanner.room.fireEvents[constants.CONSTRUCTION_COMPLETED] = this.constructor.TYPE;

    //build only one type at a time
    return false;
};

BaseBuild.prototype.buildAt = function(buildPlanner, x, y) {
    let returnValue = buildPlanner.room.createConstructionSite(x, y, this.constructor.TYPE);
    buildPlanner.room.delayedEvents[constants.CONSTRUCTION_SITE_ADDED] = 1;
};

module.exports = BaseBuild;
