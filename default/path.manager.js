let utils = require("utils");
let BaseClass = require("base.class");
let PathInfo = require("path.info");

let PathManager = BaseClass("pathManager", "pathManagers");

utils.defineInstanceMapPropertyInMemory(PathManager, "pathsInfo", function(key, id) {
    return new PathInfo(id);
});

utils.definePropertyInMemory(PathManager, "size", function() {
    return 0;
});

utils.definePropertyInMemory(PathManager, "connections", function() {
    return {};
});

//TODO inter room connections

PathManager.addPath = function(path, connectedTo) {
    let pathInfo = new PathInfo(this.size++).init(path);
    this.pathsInfo.addKey(pathInfo.id, pathInfo);
    this.connections[pathInfo.id] = {};

    let noConnections = {}, onePathConnection = {};

    for (let i = 0; i < this.size; i++) {
        if (i != pathInfo.id) {
            if (connectedTo[i]) {
                //TODO find the shorter connection for multiple paths
                for (let j in this.connections[i]) {
                    onePathConnection[j] = i;
                }

                this.connections[pathInfo.id][i] = {
                    idx : i,
                    pos : connectedTo[i].fromPos,
                    targetPos : connectedTo[i].toPos,
                };
                this.connections[i][pathInfo.id] = {
                    idx : pathInfo.id,
                    pos : connectedTo[i].toPos,
                    targetPos : connectedTo[i].fromPos,
                };
            }
            else {
                noConnections[i] = 1;
            }
        }
    }

    for (let i in noConnections) {
        if (onePathConnection[i]) {
            this.connections[pathInfo.id][i] = this.connections[pathInfo.id][onePathConnection[i]];
            this.connections[i][pathInfo.id] = this.connections[i][onePathConnection[i]];
        }
    }

    //TODO update connections between paths in 2 islands when a connecting path is added

    return pathInfo.memory.path;
};

PathManager.prototype.moveCreep = function(creep, target) {
    if (creep.hasMoved) {
        return OK;
    }
    creep.hasMoved = false;
    //if creep has reached its current target pos, find the next path
    if (creep.pathPos == creep.targetPathPos) {
        //if creep was already on the target path,
        if (creep.pathIdx == target.pathIdx) {
            //if the creep has reached target pos, return CREEP_REACHED_TARGET
            if (creep.pathPos == target.pathPos) {
                return constants.CREEP_REACHED_TARGET;
            }
        }
        //else if creep has reached the pos for its connection to next path, go through next path
        else if (creep.pathPos == this.connections[creep.pathIdx][target.pathIdx].pos) {
            creep.pathIdx = this.connections[creep.pathIdx][target.pathIdx].idx;
            creep.pathPos = this.connections[creep.pathIdx][target.pathIdx].targetPos;
        }

        //if the new pathIdx is the same as target pathIdx, assigne target's pathPos to targetPathPos,
        //else assign the pos for the connection to next path from the new path
        creep.targetPathPos = creep.pathIdx == target.pathIdx ? target.pathPos :
            this.connections[creep.pathIdx][target.pathIdx].pos;
    }

    return this.moveCreepInDir(creep);
};

PathManager.prototype.moveCreepInDir = function(creep, dir = creep.targetPathPos - creep.pathPos) {
    let pathInfo = this.pathsInfo(creep.pathIdx);
    let path, pos, oldPos = creep.pathPos, canMove = false;
    if (dir == 0 && creep.swapPos) {
        dir = creep.swapPos;
    }
    if (dir > 0) {
        if (this.canMoveCreep(creep, creep.pathPos + 1)) {
            creep.pathPos++;
            path = pathInfo.path;
            pos = creep.pathPos;
            canMove = true;
        }
    }
    else if (dir < 0) {
        if (this.canMoveCreep(creep, creep.pathPos - 1)) {
            creep.pathPos--;
            path = pathInfo.reverse;
            pos = path.length - creep.pathPos - 1;
            canMove = true;
        }
    }

    creep.processed = true;

    if (canMove) {
        //remove creep from old pos
        _.pull(pathInfo.creeps[oldPos], creep.name);
        if (pathInfo.creeps[oldPos].length == 0) {
            delete pathInfo.creeps[oldPos];
        }

        //add creep to new pos
        pathInfo.creeps[pos] = pathInfo.creeps[pos] || [];
        pathInfo.creeps[pos].push(creep.name);

        creep.hasMoved = true;
        return creep.move(path[pos].direction);
    }
    return constants.ERR_COULDNT_MOVE;
}

PathManager.prototype.canMoveCreep = function(creep, pathPos) {
    let pathInfo = this.pathsInfo(creep.pathIdx);

    if (pathInfo.creeps[pathPos]) {
        for (let i = 0; i < pathInfo.creeps[pathPos].length; i++) {
            let _creep = Game.creeps[pathInfo.creeps[pathPos][i]];

            //if creep has already moved in this tick and took the target pos then another creep cannot be there
            if (_creep.hasMoved) {
                return false;
            }

            //stationary creep. swap positions with creep
            if (_creep.pathPos == _creep.targetPathPos && !_creep.swapPos) {
                _creep.swapPos = creep.pathPos - creep.targetPathPos;

                if (_creep.processed) {
                    this.moveCreepInDir(_creep, _creep.swapPos);
                }
                return true;
            }
        }
        //TODO find obstacles from other intersecting paths
    }

    return true;
};

module.exports = PathManager;
