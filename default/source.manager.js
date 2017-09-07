/* globals Game, Room, Source, Creep, FIND_SOURCES */

let utils = require("utils");
let math = require("math");

utils.addMemorySupport(Source, "sources");

utils.definePropertyInMemory(Source, "spaces");
utils.definePropertyInMemory(Source, "creepCount");

utils.definePropertyInMemory(Creep, "source");

Source.prototype.init = function () {
    // this.pathData is set during planning of roads
    let path = this.room.pathManager.pathsInfo[this.pathIdx].path;

    let spaces = [], sourcePath = [];
    for (let x = this.pos.x - 1; x <= this.pos.x + 1; x++) {
        for (let y = this.pos.y - 1; y <= this.pos.y + 1; y++) {
            if (Game.map.getTerrainAt(x, y, this.room.name) !== "wall") {
                spaces.push({
                    x,
                    y,
                    direction: math.getDirectionBetweenPos(this.pos, {x, y}),
                    count: 0
                });
            }
        }
    }
    spaces = math.sortPositionsByDirection(spaces);

    let intersectionPos;

    spaces.forEach((space, i) => {
        let pos1 = math.getPosByDirection(this.pos, space.direction);
        let pos2 = math.getPosByDirection(pos1, space.direction);
        // path.length - 1 is the position of source,
        // path.length - 2 will be the position of container,
        // path.length - 3 will be the connection to the path around the source
        if (pos2.isEqualTo(path[path.length - 3])) {
            intersectionPos = sourcePath.length;
        }
        sourcePath.push(pos2);

        if (i < spaces.length - 1) {
            pos2 = math.getPosByDirection(pos2,
                math.rotateDirection(space.direction, 2 + (space.direction % 2 === 0)));
            if (pos2.isEqualTo(path[path.length - 3])) {
                intersectionPos = sourcePath.length;
            }
            sourcePath.push(pos2);
        }

        space.pathIdx = this.room.pathManager.size;
        space.pathPos = (i < spaces.length - 1) ? sourcePath.length - 2 : sourcePath.length - 1;
    });

    this.room.pathManager.addPath(math.getPathFromPoints(sourcePath), {
        [this.pathIdx]: {
            fromPos: path.length - 3,
            toPos: intersectionPos
        }
    });

    this.spaces = spaces;
    this.occupiedSpaces = [];
};

Source.prototype.claim = function (creep, idx) {
    this.spaces[idx].count++;
    creep.task.source = this.id;
    creep.task.space = idx;
    return this;
};

Source.prototype.release = function (creep) {
    this.spaces[creep.task.space].count--;
    delete creep.task.source;
    delete creep.task.space;
    return this;
};

utils.definePropertyInMemory(Room, "sourceManager", function () {
    return {
        sources: [],
        totalAvailableSpaces: 0,
        pointer: 0
    };
});

utils.definePropertyInCache(Room, "sources", function () {
    return this.sourceManager.sources.map((sourceId) => {
        return Game.getObjectById(sourceId);
    });
});

Room.prototype.addSources = function () {
    let sources = this.find(FIND_SOURCES);
    this.sourceManager.sources = sources.map(source => source.id);
    this.sourceManager.totalAvailableSpaces = sources.reduce(function (totalAvailableSpaces, source, i) {
        return totalAvailableSpaces + source.availableSpaces;
    }, 0);
};

Room.prototype.initSources = function () {
    this.sources.forEach((source) => {
        source.init();
    });
};

// Return a source with a free space around it and claim it
// If no souce is found, return the source with least creeps waiting
Room.prototype.findAndClaimSource = function (creep) {
    let nowaiting;
    let i = this.sourceManager.pointer;

    do {
        for (let j = 0; j < this.sources[i].spaces.length; j++) {
            if (this.sources[i].spaces[j].count === 0) {
                this.sourceManager.pointer = (this.sourceManager.pointer + 1) % this.sourceManager.sources.length;
                return this.sources[i].claim(creep, j);
            } else if (!nowaiting && this.sources[i].spaces[j].count === 1) {
                nowaiting = [this.sources[i], j];
            }
        }
        i = (i + 1) % this.sourceManager.sources.length;
    } while (i !== this.sourceManager.pointer && i < this.sourceManager.sources.length);

    return nowaiting && nowaiting[0].claim(creep, nowaiting[1]);
};
