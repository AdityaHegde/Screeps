let utils = require("utils");
let math = require("math");
let constants = require("constants");
let BaseClass = require("base.class");
let PathInfo = require("path.info");
let PathConnection = require("path.connection");

let PathManager = BaseClass("pathManager", "pathManagers");

utils.defineInstanceMapPropertyInMemory(PathManager, "pathsInfo", PathInfo);

utils.definePropertyInMemory(PathManager, "size", function() {
    return 0;
});

//TODO inter room connections

PathManager.prototype.addPath = function(path, connectedTo, findParallelPaths = true) {
    let pathInfo = new PathInfo(this.size++, findParallelPaths).init(path);
    this.pathsInfo.addKey(pathInfo.id, pathInfo);

    let noConnections = {}, onePathConnection = {};

    for (let i = 0; i < this.size; i++) {
        if (i != pathInfo.id) {
            if (connectedTo[i]) {
                //TODO find the shorter connection for multiple paths
                for (let j in this.pathsInfo[i].connections) {
                    if (this.pathsInfo[i].connections[j].idx == j) {
                        onePathConnection[j] = i;
                    }
                }

                pathInfo.connections.addKey(i, new PathConnection().init(i, connectedTo[i].toPos, connectedTo[i].fromPos));
                pathInfo.directConnections.push(i);
                this.pathsInfo[i].connections.addKey(pathInfo.id, new PathConnection().init(pathInfo.id, connectedTo[i].fromPos, connectedTo[i].toPos));
                this.pathsInfo[i].directConnections.push(pathInfo.id);
            }
            else {
                noConnections[i] = 1;
            }
        }
    }

    for (let i in noConnections) {
        if (onePathConnection[i]) {
            pathInfo.connections.addKey(i, pathInfo.connections[onePathConnection[i]]);
            this.pathsInfo[i].connections.addKey(pathInfo.id, this.pathsInfo[i].connections[onePathConnection[i]]);
        }
    }

    //TODO update connections between paths in 2 islands when a connecting path is added

    return pathInfo.id;
};

PathManager.prototype.moveCreep = function(creep, target) {
    creep.currentTarget = target;
    if (creep.hasMoved) {
        return OK;
    }
    creep.hasMoved = false;
    if (this.hasReachedTarget(creep, target)) {
        return constants.CREEP_REACHED_TARGET;
    }
    //if creep has reached its current target pos, find the next path
    if (creep.pathPos == creep.targetPathPos && target && target.pathIdx != undefined) {
        //if creep was already on the target path,
        if (creep.pathIdx == target.pathIdx) {
            //if the creep has reached target pos, return CREEP_REACHED_TARGET
            if (this.hasReachedTarget(creep, target)) {
                return constants.CREEP_REACHED_TARGET;
            }
        }
        //else if creep has reached the pos for its connection to next path, go through next path
        else if (creep.pathPos == this.pathsInfo[creep.pathIdx].connections[target.pathIdx].pos) {
            this.pathsInfo[creep.pathIdx].removeCreepFromPos(creep);
            creep.pathPos = this.pathsInfo[creep.pathIdx].connections[target.pathIdx].targetPos;
            creep.pathIdx = this.pathsInfo[creep.pathIdx].connections[target.pathIdx].idx;
            this.pathsInfo[creep.pathIdx].addCreepToPos(creep);

            //if switching path reached the target, return CREEP_REACHED_TARGET
            //can happen when target on the intersection
            if (this.hasReachedTarget(creep, target)) {
                return constants.CREEP_REACHED_TARGET;
            }
        }

        //if the new pathIdx is the same as target pathIdx, assigne target's pathPos to targetPathPos,
        //else assign the pos for the connection to next path from the new path
        creep.targetPathPos = creep.pathIdx == target.pathIdx ? target.pathPos :
            this.pathsInfo[creep.pathIdx].connections[target.pathIdx].pos;
    }

    let returnValue = this.moveCreepInDir(creep);
    //if the creep will reach the target at the end of this tick, return CREEP_REACHED_TARGET so that it can do its task
    if (this.hasReachedTarget(creep, target)) {
        return constants.CREEP_REACHED_TARGET;
    }
    return returnValue;
};

PathManager.prototype.moveCreepInDir = function(creep, dir = creep.targetPathPos - creep.pathPos, skipMoveCheck = false) {
    let pathInfo = this.pathsInfo[creep.pathIdx];
    let path, pos, oldPos = creep.pathPos, moveDir, canMove = false;
    if (dir == 0 && creep.swapPos) {
        dir = creep.swapPos;
    }
    if (creep.movedAway) {
        if (skipMoveCheck || this.canMoveCreep(creep, creep.pathPos, false, true)) {
            path = pathInfo.path;
            pos = creep.pathPos;
            canMove = true;
            moveDir = math.rotateDirection(creep.movedAway, 4);
        }
    }
    else if (dir > 0) {
        if (skipMoveCheck || this.canMoveCreep(creep, creep.pathPos + 1)) {
            creep.pathPos++;
            path = pathInfo.path;
            pos = creep.pathPos;
            canMove = true;
            moveDir = path[oldPos].direction;
        }
    }
    else if (dir < 0) {
        if (skipMoveCheck || this.canMoveCreep(creep, creep.pathPos - 1)) {
            creep.pathPos--;
            path = pathInfo.reverse;
            pos = path.length - creep.pathPos - 1;
            canMove = true;
            moveDir = path[oldPos].direction;
        }
    }

    creep.processed = true;
    //console.log(creep.name, canMove, dir, moveDir);

    if (canMove) {
        //if creep is not moving into the path, remove from old pos and add to new pos
        //else it would be in the same pathPos so no need to remove and add
        if (!creep.movedAway) {
            //remove creep from old pos
            pathInfo.removeCreepFromPos(creep, oldPos);

            //add creep to new pos
            pathInfo.addCreepToPos(creep);
        }

        creep.hasMoved = true;
        creep.movedAway = 0;
        creep.movingAway = 0;
        return creep.move(moveDir);
    }
    return constants.ERR_COULDNT_MOVE;
};

//move creeps towards the target away from the path or away from the target towards the path
//towards = moving towards path
PathManager.prototype.moveCreepTowards = function(creep, towards = true, skipMoveCheck = false) {
    //console.log("moveCreepTowards", creep.name);
    //if the creep hasnt already moved, check if it can move away from path at its current pos
    if (!creep.hasMoved && (skipMoveCheck || this.canMoveCreep(creep, creep.pathPos, true))) {
        creep.hasMoved = true;
        creep.movedAway = towards ? 0 : creep.currentTarget.moveAway;
        creep.movingAway = 0;
        return creep.move(creep.movedAway);
    }
    else {
        creep.movingAway = towards ? 0 : creep.currentTarget.moveAway;
        return constants.ERR_COULDNT_MOVE;
    }
};

PathManager.prototype.canMoveCreep = function(creep, pathPos, movingAway = false, movingTowards = false) {
    //console.log("canMoveCreep", creep.name);
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
        if (creeps[i] == creep.name) {
            continue;
        }

        let _creep = Game.creeps[creeps[i]];
        //console.log("canMoveCreep check", _creep.name, _creep.hasMoved);

        //creep is moving out of this pos
        if (_creep.processing) {
            continue;
        }

        //if _creep has already moved in this tick and took the target pos then another creep cannot be there
        if (_creep.hasMoved) {
            //if, _creep has not moved away and creep is not moving away,
            //     or _creep has moved to the same direction as creep is trying to move to
            if ((!_creep.movedAway && !movingAway) ||
                (_creep.movedAway == creep.currentTarget.moveAway)) {
                return false;
            }
            //else ignore the _creep
            else {
                continue;
            }
        }

        //console.log(_creep.name, _creep.pathPos == _creep.targetPathPos && !_creep.swapPos, movingAway, movingTowards, _creep.movedAway, _creep.movingAway);
        if (_creep.pathPos == _creep.targetPathPos && !_creep.swapPos) {
            //console.log(_creep.name, movingAway, movingTowards, _creep.movedAway, _creep.movingAway, creep.currentTarget.moveAway);
            //if there is a stationary creep moved away from path in the same direction, dont move this creep
            if (movingAway && _creep.movedAway == creep.currentTarget.moveAway) {
                return false;
            }
            //else if moving towards and another creep is moving away in the same direction, swap positions
            //or if not movingTowards, ie just moving along the path, swap positions
            else if ((movingTowards && _creep.movingAway == creep.movedAway) || !movingTowards) {
                //console.log(creep.name, _creep.name);
                _creep.swapPos = creep.pathPos - creep.targetPathPos;
                //if the creep is in another path, ie at the intersection
                if (_creep.pathIdx != creep.pathIdx) {
                    _creep.pathIdx = creep.pathIdx;
                    _creep.pathPos = _creep.targetPathPos = pathPos;
                }

                //if the creep was already processed, move it right now
                if (_creep.processed) {
                    //if creep is moving towards path, _creep will move away from path
                    if (movingTowards) {
                        this.moveCreepTowards(_creep, false, true);
                    }
                    //else creep is moving along the path, _creep will move in opposite direction along the path
                    else {
                        this.moveCreepInDir(_creep, _creep.swapPos, true);
                    }
                }
                return true;
            }
        }
        //if the creep is not stationary and yet to move on another path dont move,
        //this is a temp fix for cross path blocks
        else if (_creep.pathIdx != creep.pathIdx) {
            return false;
        }
    }

    return true;
};

PathManager.prototype.hasReachedTarget = function(creep, target) {
    //console.log("hasReachedTarget", creep.name, target.moveAway);
    if (this.hasReachedTargetPos(creep, target)) {
        //console.log("hasReachedTargetPos", creep.name, creep.hasMoved);
        if (target.moveAway && !creep.pos.isEqualTo(target.pos) && !creep.hasMoved) {
            return this.moveCreepTowards(creep, false) == OK;
        }
        return true;
    }
    return false;
};

PathManager.prototype.hasReachedTargetPos = function(creep, target) {
    return creep.pathIdx == target.pathIdx && creep.pathPos == target.pathPos;
};

PathManager.prototype.creepHasDied = function(creep) {
    this.pathsInfo[creep.pathIdx].removeCreepFromPos(creep);
};

module.exports = PathManager;
