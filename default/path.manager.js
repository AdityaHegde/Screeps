/* globals Game,OK */

let utils = require("utils");
let math = require("math");
let constants = require("constants");
let BaseClass = require("base.class");
let PathInfo = require("path.info");
let PathConnection = require("path.connection");

let PathManager = BaseClass("pathManager", "pathManagers");

utils.defineInstanceMapPropertyInMemory(PathManager, "pathsInfo", PathInfo);

utils.definePropertyInMemory(PathManager, "size", function () {
    return 0;
});

utils.definePropertyInMemory(PathManager, "pathsMatrix", function () {
    return {};
});

utils.definePropertyInMemory(PathManager, "pathIdxsByExit", function () {
    return {};
});

utils.definePropertyInMemory(PathManager, "wallPathIdxsByExit", function () {
    return {};
});

// TODO inter room connections

PathManager.prototype.addPath = function (path, findParallelPaths = false) {
    let dedupedPathParts = this.dedupePathParts(path);
    let pathInfos;

    return dedupedPathParts.map((pathPart) => {
        return this.addPathPart(pathPart);
    });
};

PathManager.prototype.addPathPart = function (pathPart, findParallelPaths = false) {
    let pathInfo = new PathInfo(this.size++).init(pathPart.path, findParallelPaths);
    let connections = {};

    pathInfo.populatePathsMatrix(this.pathsMatrix);

    pathPart.startPathIdxs.forEach((pathIdx) => {
        connections[pathIdx.idx] = {
            idx: pathIdx.idx,
            fromPos: pathIdx.pos,
            toPos: 0
        };
    });
    pathPart.endPathIdxs.forEach((pathIdx) => {
        connections[pathIdx.idx] = {
            idx: pathIdx.idx,
            fromPos: pathIdx.pos,
            toPos: pathPart.path.length - 1
        };
    });
    pathPart.intersections.forEach((intersection) => {
        connections[intersection.idx] = {
            idx: intersection.idx,
            fromPos: intersection.pos,
            toPos: intersection.from
        };
    });

    let noConnections = {};
    let onePathConnection = {};
    let islands = {};

    for (let i = 0; i < this.size; i++) {
        if (i !== pathInfo.id) {
            if (connections[i]) {
                // TODO find the shorter connection for multiple paths
                for (let j in this.pathsInfo[i].connections) {
                    // eslint-disable-next-line eqeqeq
                    if (this.pathsInfo[i].connections[j].idx == j) {
                        onePathConnection[j] = i;
                    }
                    else if (!(j in onePathConnection)) {
                        onePathConnection[j] = i;
                    }
                }

                pathInfo.connections.addKey(i,
                    new PathConnection().init(i, connections[i].toPos, connections[i].fromPos));
                pathInfo.directConnections.push(i);
                this.pathsInfo[i].connections.addKey(pathInfo.id,
                    new PathConnection().init(pathInfo.id, connections[i].fromPos, connections[i].toPos));
                this.pathsInfo[i].directConnections.push(pathInfo.id);
            } else {
                noConnections[i] = 1;
            }

            // if count of registered connections is less than paths - path i - new path,
            // there is an island
            if (_.size(this.pathsInfo[i].connections) < this.size - 2) {
                islands[i] = _.size(this.pathsInfo[i].connections);
            }
        }
    }

    // console.log(pathInfo.id, noConnections, onePathConnection, islands);

    for (let i in noConnections) {
        if (i in onePathConnection) {
            pathInfo.connections.addKey(i, pathInfo.connections[onePathConnection[i]]);
            this.pathsInfo[i].connections.addKey(pathInfo.id, this.pathsInfo[i].connections[onePathConnection[i]]);
        }
    }

    for (let i in islands) {
        // if count of registered connections on this path greater than islands,
        // this is connections between islands
        if (_.size(pathInfo.connections) > islands[i]) {
            for (let j in pathInfo.connections) {
                if (!this.pathsInfo[i].connections[j] && i !== j) {
                    this.pathsInfo[i].connections.addKey(j, this.pathsInfo[i].connections[pathInfo.id]);
                    this.pathsInfo[j].connections.addKey(i, this.pathsInfo[j].connections[pathInfo.id]);
                }
            }
        }
    }

    this.pathsInfo.addKey(pathInfo.id, pathInfo);

    return pathInfo;
};

function getPathIdxs (pathsMatrix, key) {
    return _.map(_.keys(pathsMatrix[key]), (idx) => {
        return {
            idx: idx,
            pos: pathsMatrix[key][idx]
        };
    });
}

// if there is parts of the path common to other paths already registered,
// split them up and add them as seperate paths deduping those parts
PathManager.prototype.dedupePathParts = function (path) {
    let startPathIdxs = [];
    let curPathIdx = -1;
    let startPartPos = 0;
    let intersections = [];
    let pathParts = [];
    let lastKey;

    for (let i = 1; i < path.length; i++) {
        let lastKey = path[i-1].x + "__" + path[i-1].y;
        let key = path[i].x + "__" + path[i].y;

        if (this.pathsMatrix[lastKey] && this.pathsMatrix[key] && !this.pathsMatrix[key][curPathIdx]) {
            let commonIdxs = _.intersection(
                _.keys(this.pathsMatrix[lastKey]),
                _.keys(this.pathsMatrix[key])
            );

            if (commonIdxs.length > 0) {
                if (curPathIdx === -1 && i !== 1) {
                    pathParts.push({
                        path: path.slice(startPartPos, i),
                        startPathIdxs: startPathIdxs,
                        endPathIdxs: getPathIdxs(this.pathsMatrix, lastKey),
                        intersections: intersections
                    });
                }
                curPathIdx = commonIdxs[0];
            } else {
                startPathIdxs = getPathIdxs(this.pathsMatrix, lastKey);
                startPartPos = i - 1;
                intersections = [];
                curPathIdx = -1;
            }
        } else if (this.pathsMatrix[lastKey] && !this.pathsMatrix[key]) {
            if (curPathIdx === -1) {
                intersections.push(..._.map(_.keys(this.pathsMatrix[lastKey]), (idx) => {
                    return {
                        idx: idx,
                        from: i - startPartPos,
                        pos: this.pathsMatrix[lastKey][idx]
                    };
                }));
            } else {
                startPathIdxs = getPathIdxs(this.pathsMatrix, lastKey);
                startPartPos = i - 1;
                intersections = [];
            }
            curPathIdx = -1;
        }
    }

    if (curPathIdx === -1) {
        pathParts.push({
            path: path.slice(startPartPos),
            startPathIdxs: startPathIdxs,
            endPathIdxs: [],
            intersections: intersections
        });
    }

    // console.log("---");
    // pathParts.forEach((pathPart) => {
    //     console.log(pathPart);
    // });

    return pathParts;
};

PathManager.prototype.moveCreep = function (creep, target) {
    creep.currentTarget = target;
    if (creep.hasMoved) {
        return OK;
    }
    creep.hasMoved = false;
    if (this.hasReachedTarget(creep, target)) {
        return constants.CREEP_REACHED_TARGET;
    }
    // if creep has reached its current target pos, find the next path
    if (creep.pathPos === creep.targetPathPos && target && target.pathIdx !== undefined) {
        // if creep was already on the target path,
        if (creep.pathIdx === target.pathIdx) {
            // if the creep has reached target pos, return CREEP_REACHED_TARGET
            if (this.hasReachedTarget(creep, target)) {
                return constants.CREEP_REACHED_TARGET;
            }
        } else if (creep.pathPos === this.pathsInfo[creep.pathIdx].connections[target.pathIdx].pos) {
        // else if creep has reached the pos for its connection to next path, go through next path
            this.pathsInfo[creep.pathIdx].removeCreepFromPos(creep);
            creep.pathPos = this.pathsInfo[creep.pathIdx].connections[target.pathIdx].targetPos;
            creep.pathIdx = this.pathsInfo[creep.pathIdx].connections[target.pathIdx].idx;
            this.pathsInfo[creep.pathIdx].addCreepToPos(creep);

            // if switching path reached the target, return CREEP_REACHED_TARGET
            // can happen when target on the intersection
            if (this.hasReachedTarget(creep, target)) {
                return constants.CREEP_REACHED_TARGET;
            }
        }

        // if the new pathIdx is the same as target pathIdx, assigne target's pathPos to targetPathPos,
        // else assign the pos for the connection to next path from the new path
        creep.targetPathPos = creep.pathIdx === target.pathIdx ? target.pathPos
            : this.pathsInfo[creep.pathIdx].connections[target.pathIdx].pos;
    }

    let returnValue = this.moveCreepInDir(creep);
    // if the creep will reach the target at the end of this tick, return CREEP_REACHED_TARGET so that it can do its task
    if (this.hasReachedTarget(creep, target)) {
        return constants.CREEP_REACHED_TARGET;
    }
    return returnValue;
};

PathManager.prototype.moveCreepInDir = function (creep, dir = creep.targetPathPos - creep.pathPos, skipMoveCheck = false) {
    let pathInfo = this.pathsInfo[creep.pathIdx];
    let path;
    let oldPos = creep.pathPos;
    let moveDir;
    let canMove = false;
    if (dir === 0 && creep.swapPos) {
        dir = creep.swapPos;
    }
    if (creep.movedAway) {
        if (skipMoveCheck || this.canMoveCreep(creep, creep.pathPos, false, true)) {
            path = pathInfo.path;
            canMove = true;
            moveDir = math.rotateDirection(creep.movedAway, 4);
        }
    } else if (dir > 0) {
        if (skipMoveCheck || this.canMoveCreep(creep, creep.pathPos + 1)) {
            creep.pathPos++;
            path = pathInfo.path;
            canMove = true;
            moveDir = path[oldPos].direction;
        }
    } else if (dir < 0) {
        if (skipMoveCheck || this.canMoveCreep(creep, creep.pathPos - 1)) {
            creep.pathPos--;
            path = pathInfo.reverse;
            canMove = true;
            moveDir = path[oldPos].direction;
        }
    }

    creep.processed = true;

    if (canMove) {
        // if creep is not moving into the path, remove from old pos and add to new pos
        // else it would be in the same pathPos so no need to remove and add
        if (!creep.movedAway) {
            // remove creep from old pos
            pathInfo.removeCreepFromPos(creep, oldPos);

            // add creep to new pos
            pathInfo.addCreepToPos(creep);
        }

        creep.hasMoved = true;
        creep.movedAway = 0;
        creep.movingAway = 0;
        return creep.move(moveDir);
    }
    return constants.ERR_COULDNT_MOVE;
};

// move creeps towards the target away from the path or away from the target towards the path
// towards = moving towards path
PathManager.prototype.moveCreepTowards = function (creep, towards = true, skipMoveCheck = false) {
    // if the creep hasnt already moved, check if it can move away from path at its current pos
    if (!creep.hasMoved && (skipMoveCheck || this.canMoveCreep(creep, creep.pathPos, true))) {
        creep.hasMoved = true;
        creep.movedAway = towards ? 0 : creep.currentTarget.direction;
        creep.movingAway = 0;
        return creep.move(creep.movedAway);
    } else {
        creep.movingAway = towards ? 0 : creep.currentTarget.direction;
        return constants.ERR_COULDNT_MOVE;
    }
};

PathManager.prototype.canMoveCreep = function (creep, pathPos, movingAway = false, movingTowards = false) {
    let pathInfo = this.pathsInfo[creep.pathIdx];

    let creeps = [];

    if (pathInfo.creeps[pathPos]) {
        creeps.push(...pathInfo.creeps[pathPos]);
    }
    pathInfo.directConnections.forEach((connection) => {
        if (this.pathsInfo[connection].creeps[pathInfo.connections[connection].targetPos]) {
            creeps.push(...this.pathsInfo[connection].creeps[pathInfo.connections[connection].targetPos]);
        }
    });

    for (let i = 0; i < creeps.length; i++) {
        if (creeps[i] === creep.name) {
            continue;
        }

        let _creep = Game.creeps[creeps[i]];

        // creep is moving out of this pos
        if (_creep.processing) {
            continue;
        }

        // if _creep has already moved in this tick and took the target pos then another creep cannot be there
        if (_creep.hasMoved) {
            // if, _creep has not moved away and creep is not moving away,
            //     or _creep has moved to the same direction as creep is trying to move to
            if ((!_creep.movedAway && !movingAway) ||
                (_creep.movedAway === creep.currentTarget.direction)) {
                return false;
            } else {
                // else ignore the _creep
                continue;
            }
        }

        if (_creep.pathPos === _creep.targetPathPos && !_creep.swapPos) {
            // if there is a stationary creep moved away from path in the same direction, dont move this creep
            if (movingAway && _creep.movedAway === creep.currentTarget.direction) {
                return false;
            } else if ((movingTowards && _creep.movingAway === creep.movedAway) || !movingTowards) {
                // else if moving towards and another creep is moving away in the same direction, swap positions
                // or if not movingTowards, ie just moving along the path, swap positions
                _creep.swapPos = creep.pathPos - creep.targetPathPos;
                // if the creep is in another path, ie at the intersection
                if (_creep.pathIdx !== creep.pathIdx) {
                    _creep.pathIdx = creep.pathIdx;
                    _creep.pathPos = _creep.targetPathPos = pathPos;
                }

                // if the creep was already processed, move it right now
                if (_creep.processed) {
                    if (movingTowards) {
                        // if creep is moving towards path, _creep will move away from path
                        this.moveCreepTowards(_creep, false, true);
                    } else {
                        // else creep is moving along the path, _creep will move in opposite direction along the path
                        this.moveCreepInDir(_creep, _creep.swapPos, true);
                    }
                }
                return true;
            }
        } else if (_creep.pathIdx !== creep.pathIdx) {
            // if the creep is not stationary and yet to move on another path dont move,
            // this is a temp fix for cross path blocks
            return false;
        }
    }

    return true;
};

PathManager.prototype.hasReachedTarget = function (creep, target) {
    if (this.hasReachedTargetPos(creep, target)) {
        if (target.direction && !creep.pos.isEqualTo(target.pos) && !creep.hasMoved) {
            return this.moveCreepTowards(creep, false) === OK;
        }
        return true;
    }
    return false;
};

PathManager.prototype.hasReachedTargetPos = function (creep, target) {
    return creep.pathIdx === target.pathIdx && creep.pathPos === target.pathPos;
};

PathManager.prototype.creepHasDied = function (creep) {
    this.pathsInfo[creep.pathIdx].removeCreepFromPos(creep);
};

module.exports = PathManager;
