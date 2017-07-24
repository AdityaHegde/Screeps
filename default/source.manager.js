let utils = require("utils");
let math = require("math");

utils.addMemorySupport(Source, "sources");

utils.definePropertyInMemory(Source, "spaces");

utils.definePosPropertyInMemory(Source, "container");

utils.definePropertyInMemory(Source, "occupiedSpaces");

utils.definePropertyInMemory(Source, "pathIdx");
utils.definePropertyInMemory(Source, "pathPos");

utils.definePropertyInMemory(Creep, "source");

Source.prototype.init = function(pathIdx, pathPos, lastButOnePos) {
    this.pathIdx = pathIdx;
    this.pathPos = pathPos;

    let spaces = [], path = [];
    for (let x = this.pos.x - 1; x <= this.pos.x + 1; x++) {
        for (let y = this.pos.y - 1; y <= this.pos.y + 1; y++) {
            if (Game.map.getTerrainAt(x, y, this.room.name) != "wall") {
                spaces.push({
                    x, y,
                    direction : math.getDirectionBetweenPos(this.pos, {x, y}),
                })
                availableSpaces++;
            }
        }
    }
    spaces = math.sortPositionsByDirection(spaces);

    let lastPos2, intersectionPos;

    spaces.forEach((space) => {
        let pos1 = math.getPosByDirection(this.pos, space.direction);
        let pos2 = math.getPosByDirection(pos1, space.direction);
        if (pos2.isEqualTo(lastButOnePos)) {
            intersectionPos = path.length;
        }
        path.push(pos2);

        if (lastPos2) {
            pos2 = math.getPosByDirection(pos2, math.rotateDirection(space.direction, -1));
            if (pos2.isEqualTo(lastButOnePos)) {
                intersectionPos = path.length;
            }
            path.push(pos2);
        }

        lastPos2 = true;

        space.pathIdx = this.room.pathManager.size;
        space.pathPos = path.length - 1;
    });

    this.room.pathManager.addPath(math.getPathFromPoints(path), {
        [pathIdx] : {
            fromPos : pathPos,
            toPos : intersectionPos,
        },
    });

    this.spaces = spaces;
    this.occupiedSpaces = 0;
};

Source.prototype.claim = function(creep) {
    creep.task.source = this.id;
    this.occupiedSpaces++;
};

Source.prototype.release = function(creep) {
    delete creep.task.source;
    this.occupiedSpaces--;
};

utils.definePropertyInMemory(Room, "sourceManager", function() {
    return {
        sources : [],
        totalAvailableSpaces : 0,
        pointer : 0,
    };
});

utils.definePropertyInCache(Room, "sources", function() {
    return this.sourceManager.sources.map((sourceId) => {
        return Game.getObjectById(sourceId);
    });
});

Room.prototype.addSources = function() {
    let sources = this.find(FIND_SOURCES);
    this.sourceManager.sources = sources.map(source => source.id);
    this.sourceManager.totalAvailableSpaces = sources.reduce(function(totalAvailableSpaces, source, i) {
        return totalAvailableSpaces + source.availableSpaces;
    }, 0);
};

//Return a source with a free space around it.
//If no souce is found, return the source with least creeps waiting
Room.prototype.findSource = function() {
    let minDiff = 999, minSource, i = this.sourceManager.pointer;

    do {
        let source = Game.getObjectById(this.sourceManager.sources[i]);
        if (source.occupiedSpaces < source.availableSpaces) {
            this.sourceManager.pointer = (this.sourceManager.pointer + 1) % this.sourceManager.sources.length;
            //if there is a free space, just return it
            return source;
        }
        else if (source.occupiedSpaces - source.availableSpaces < minDiff) {
            //else select the source with min overflow of creeps
            minDiff = source.occupiedSpaces - source.availableSpaces;
            minSource = source;
        }

        i = (i + 1) % this.sourceManager.sources.length;
    } while (i != this.sourceManager.pointer && i < this.sourceManager.sources.length);

    return minSource;
};
