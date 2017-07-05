let utils = require("utils");

utils.addMemorySupport(Source.prototype, "sources");

utils.definePropertyInMemory(Source.prototype, "availableSpaces", function() {
    var availableSpaces = 0;
    //check for available spaces around the source
    for (var x = this.pos.x - 1; x <= this.pos.x + 1; x++) {
        for (var y = this.pos.y - 1; y <= this.pos.y + 1; y++) {
            if (Game.map.getTerrainAt(x, y, this.room.name) != "wall") {
                availableSpaces++;
            }
        }
    }
    return availableSpaces;
});

utils.definePropertyInMemory(Source.prototype, "occupiedSpaces", function() {
    return 0;
});

utils.definePropertyInMemory(Creep.prototype, "source", function() {
    return null;
});

Source.prototype.claim = function(creep) {
    creep.task.source = this.id;
    this.occupiedSpaces++;
};

Source.prototype.release = function(creep) {
    delete creep.task.source;
    this.occupiedSpaces--;
};


utils.definePropertyInMemory(Room.prototype, "sourceManager", function() {
    return {
        sources : [],
        totalAvailableSpaces : 0,
        pointer : 0,
    };
});

Room.prototype.addSources = function() {
    var sources = this.find(FIND_SOURCES);
    this.sourceManager.sources = sources.map(source => source.id);
    this.sourceManager.totalAvailableSpaces = sources.reduce(function(totalAvailableSpaces, source) {
        return totalAvailableSpaces + source.availableSpaces;
    }, 0);
};

//Return a source with a free space around it.
//If no souce is found, return the source with least creeps waiting
Room.prototype.findSource = function() {
    var minDiff = 999, minSource, i = this.sourceManager.pointer;

    do {
        var source = Game.getObjectById(this.sourceManager.sources[i]);
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
