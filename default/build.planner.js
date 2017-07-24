let constants = require("constants");
let utils = require("utils");
let math = require("math");
let eventBus = require("event.bus");
let BaseClass = require("base.class");
let BUILD_TYPES = require("build.list").types;
let BUILD_INIT_OBJECTS = require("build.list").initObjects;

let BuildPlanner = BaseClass("buildPlanner", "buildPlanner");

BuildPlanner.init = function() {
    [constants.CONTAINER_BUILT, constants.EXTENSION_BUILT, constants.WALL_BUILT, constants.TOWER_BUILT].forEach((event) => {
        eventBus.subscribe(event, "built", "buildPlanner");
    });
    eventBus.subscribe(constants.CONSTRUCTION_SCEDULED, "constructionSiteAdded", "buildPlanner");
};

utils.addMemorySupport(BuildPlanner, "buildPlanner");

//utils.defineInstancePropertyByNameInMemory(BuildPlanner, "room", "rooms");

utils.definePropertyInMemory(BuildPlanner, "pathsInfo", function() {
    return [];
});

utils.definePosPropertyInMemory(BuildPlanner, "center");

utils.definePropertyInMemory(BuildPlanner, "lastLevel", function() {
    return 0;
});

utils.definePropertyInMemory(BuildPlanner, "structureData", function() {
    return {};
});

utils.definePropertyInMemory(BuildPlanner, "cursor", function() {
    return 0;
});
utils.definePropertyInMemory(BuildPlanner, "pathCursor", function() {
    return 0;
});
utils.definePropertyInMemory(BuildPlanner, "posCursor", function() {
    return 0;
});

utils.defineCostMatrixPropertyInMemory(BuildPlanner, "costMatrix");


utils.definePropertyInMemory(ConstructionSite, "pathIdx");
utils.definePropertyInMemory(ConstructionSite, "pathPos");
utils.definePropertyInMemory(ConstructionSite, "moveAway");


BuildPlanner.prototype.plan = function() {
    let center;

    this.costMatrix = new PathFinder.CostMatrix;

    if (this.room.spawns.length == 0) {
        let points = [this.room.controller.pos];
        points.push(...this.room.sources.map(source => source.pos));
        //points.push(room.mineral);

        center = math.getCentroid(points);
    }
    else if (Game.flags[this.room.name]) {
        center = Game.flags[this.room.name].pos;
    }
    else {
        let spawn = Game.spawns[this.room.spawns[0]];
        //avoid the spawn
        this.costMatrix.set(spawn.pos.x, spawn.pos.y, 255);
        center = {
            x : spawn.pos.x - 1,
            y : spawn.pos.y - 1,
        };
    }

    this.checkedMap = {};
    this.lookAtMatrix = {};

    this.center = this.checkAroundPoint(center.x, center.y);
};

//TODO improve this to not check each and every point
BuildPlanner.prototype.checkAroundPoint = function(x, y) {
    if (x < 0 || x > 49 || y < 0 || y > 49 || this.checkedMap[x + "__" + y]) {
        return null;
    }

    let total = 0;
    let sigX = {}, dirLX = -5, dirRX = 5;
    let sigY = {}, dirLY = -5, dirRY = 5;

    for (let i = -2; i <= 2; i++) {
        sigX[i] = 0;
        this.lookAtMatrix[x + i] = this.lookAtMatrix[x + i] || {};

        for (let j = -2; j <= 2; j++) {
            sigY[j] = 0;
            if (!this.lookAtMatrix[x + i][y + j]) {
                this.lookAtMatrix[x + i][y + j] = this.room.lookForAt(LOOK_TERRAIN, x + i, y + j) || [];
            }

            let point = this.lookAtMatrix[x + i][y + j][0];
            if (point == "plain") {
                sigX[i]++;
                if (sigX[i] == 5 && dirLX - i - 3 == 0) {
                    dirLX = i - 2;
                }
                sigY[j]++;
                if (sigY[i] == 5 && dirLY - i - 3 == 0) {
                    dirLY = i - 2;
                }
                total++;
            }
        }
    }

    this.checkedMap[x + "__" + y] = 1;

    if (total == 25) {
        return {
            x : x,
            y : y,
        };
    }

    for (let i = 2; i >= -2; i--) {
        if (sigX[i] == 5 && dirRX - i - 3 == 0) {
            dirRX = i + 2;
        }
        if (sigY[i] == 5 && dirRY - i - 3 == 0) {
            dirRY = i + 2;
        }
    }

    return this.checkAroundPoint(x - dirLX, y) ||
           this.checkAroundPoint(x, y - dirLY) ||
           this.checkAroundPoint(x + dirRX, y) ||
           this.checkAroundPoint(x, y + dirRY);
};

BuildPlanner.prototype.init = function(room) {
    this.costMatrix = this.costMatrix || new PathFinder.CostMatrix();
    let begCpu = Game.cpu.getUsed();
    if (!this.center) {
        this.room = room;
        this.plan();
        this.center = this.center || {x : 25, y : 25};
        return false;
    }
    else {
        //loop until there is enough cpu
        while((Game.cpu.getUsed() - begCpu) < Game.cpu.tickLimit - 5 && this.cursor < BUILD_INIT_OBJECTS.length) {
            let build = BUILD_INIT_OBJECTS[this.cursor];
            if (this.pathsInfo.length < this.cursor + 1) {
                this.pathsInfo.push({
                    paths : [],
                    type : build.type,
                });
            }
            let pathInfo = this.pathsInfo[this.cursor];
            let cursorObjects = build.getter(this);
            //loop until there is enough cpu
            //have a 5 ticks buffer
            for (; this.pathCursor < cursorObjects.length && (Game.cpu.getUsed() - begCpu) < Game.cpu.tickLimit - 5; this.pathCursor++) {
                pathInfo.paths.push(...BUILD_TYPES[build.type].initForCursorObject(this, cursorObjects[this.pathCursor], this.pathCursor, build.maxCount, pathInfo.paths.length));
            }

            if (this.pathCursor == cursorObjects.length) {
                this.pathCursor = 0;
                this.cursor++;
            }
        }
    }
    this.costMatrix = this.costMatrix || new PathFinder.CostMatrix();

    return this.cursor == BUILD_INIT_OBJECTS.length;
};

BuildPlanner.prototype.build = function() {
    //check if RCL changed or some structures are yet to be built for current RCL
    //or there are some structures are being built
    if (!this.room.tasksInfo.build.hasTarget &&
        (this.room.controller.level > this.lastLevel || this.cursor < this.pathsInfo.length)) {
        //reset the cursor when executed for the 1st time RCL changed
        if (this.cursor == this.pathsInfo.length) {
            this.cursor = 0;
        }

        for (; this.cursor < this.pathsInfo.length; this.cursor++) {
            //if the structure is yet to be finished, break
            if (!BUILD_TYPES[this.pathsInfo[this.cursor].type].build(this)) {
                break;
            }
        }

        if (this.cursor == this.pathsInfo.length) {
            //proceed only if all structures for this level are built
            this.lastLevel = this.room.controller.level;
        }
    }
};

BuildPlanner.prototype.built = function(structures) {
    structures.forEach((structure) => {
        BUILD_TYPES[structure.structureType].built(this, structure);
    });
};

BuildPlanner.prototype.constructionSiteAdded = function(constructionSites) {
    constructionSites.forEach((constructionSite) => {
        BUILD_TYPES[constructionSite.structureType].constructionSiteAdded(this, constructionSite);
    });
};

module.exports = BuildPlanner;
