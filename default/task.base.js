let utils = require("utils");
let constants = require("constants");
let BaseClass = require("base.class");
let eventBus = require("event.bus");

/**
* Base task class
*
* @module task
* @class BaseTask
*/

let BaseTask = BaseClass("task", "tasks");

BaseTask.EVENT_LISTENERS = [];
BaseTask.UPDATE_TARGET_EVENTS = [];
BaseTask.TASK_NAME = "base";

BaseTask.init = function() {
    this.EVENT_LISTENERS.forEach((eventListener) => {
        eventBus.subscribe(eventListener.eventName, eventListener.method, "tasksInfo." + this.TASK_NAME);
    });
    this.UPDATE_TARGET_EVENTS.forEach((eventListener) => {
        eventBus.subscribe(eventListener, "updateTargetsMap", "tasksInfo." + this.TASK_NAME);
    });
};

BaseTask.__staticMembers = {
    "EVENT_LISTENERS" : 1,
    "UPDATE_TARGET_EVENTS" : 1,
    "TASK_NAME" : 1,
    "init" : 1,
};

utils.definePropertyInMemory(BaseTask, "targetsMap", function() {
    return {};
});

utils.definePropertyInMemory(BaseTask, "hasTarget", function() {
    return false;
});

utils.definePropertyInMemory(BaseTask, "creeps", function() {
    return {};
});

utils.definePropertyInMemory(BaseTask, "creepsCount", function() {
    return 0;
});

//utils.defineInstancePropertyByNameInMemory(BaseTask, "room", "rooms");

BaseTask.prototype.init = function(room) {
    this.room = room;
    this.updateTargetsMap();
    this.hasTarget = Object.keys(this.targetsMap).length > 0;
};

BaseTask.prototype.tick = function() {
};

BaseTask.prototype.getTarget = function(creep) {
    let target;
    if (!creep.task.targets[creep.task.tier]) {
        target = this.assignNewTarget(creep);
    }
    else {
        target = Game.getObjectById(creep.task.targets[creep.task.tier]);
    }
    if (!target || !this.isTargetValid(target)) {
        this.targetIsInvalid(creep, target);
        //if target is invalid, remove it from targets of the task and get a new target
        delete this.targetsMap[creep.task.targets[creep.task.tier]];
        target = this.assignNewTarget(creep);
    }
    this.hasTarget =  Object.keys(this.targetsMap).length > 0;
    return target;
};

BaseTask.prototype.assignNewTarget = function(creep) {
    //get the closest target
    creep.task.targets[creep.task.tier] = utils.getClosestObject(creep, Object.keys(this.targetsMap), (target) => {
        //filter out targets that are assgined to other creeps and are not valid for more
        //eg : creepA is picking up 50 energy from a container with 50 energy.
        //     creepB cannot pickup from the same container as there wont be energy left after creepA is done picking up
        return this.isAssignedTargetValid(target);
    });
    let target = Game.getObjectById(creep.task.targets[creep.task.tier]);
    if (target) {
        this.targetIsClaimed(creep, target);
    }
    return target;
};

BaseTask.prototype.updateTargetsMap = function(newTargets) {
    if (!newTargets || newTargets == 1) {
        //force updating targets
        this.targetsMap = this.getTargetsMap();
    }
    else {
        //add new targets from event
        newTargets.forEach((target) =>{
            if (this.targetsFilter(target)) {
                this.targetsMap[target.id] = 0;
            }
        });
    }
    this.hasTarget = Object.keys(this.targetsMap).length > 0;
};

BaseTask.prototype.getTargetsMap = function() {
    let targetsMap = {};
    this.getTargets().forEach((target) => {
        targetsMap[target] = 0;
    });
    return targetsMap;
};

BaseTask.prototype.getTargets = function() {
    return [];
};

BaseTask.prototype.targetsFilter = function(target) {
    return true;
};

BaseTask.prototype.execute = function(creep) {
    creep.processed = true;
    let target = this.getTarget(creep);
    //console.log(creep.name, target);
    //if there was no target found for this task
    if (!target) {
        return ERR_INVALID_TARGET;
    }
    //if the current task became invalid, return ERR_INVALID_TASK
    if (!this.isTaskValid(creep, target)) {
        return constants.ERR_INVALID_TASK;
    }
    let returnValue = this.doTask(creep, target);
    //if the target is not in range, move the creep to it
    if (returnValue == ERR_NOT_IN_RANGE) {
        return this.moveCreep(creep, target);
    }
    else if (returnValue == OK) {
        //mark the creep as stationary
        creep.pathDir = 0;
        this.taskExecuted(creep, target);

        if (creep.swapPos) {
            this.moveCreepInDir(creep, creep.swapPos);
        }
    }
    //return false if there is no enough resources,
    //returning false will make the manager assign to next task in queue
    return returnValue;
};

BaseTask.prototype.doTask = function(creep, target) {
    return OK;
};

BaseTask.prototype.taskExecuted = function(creep, target) {
    this.targetIsReleased(creep, target);
};

BaseTask.prototype.taskStarted = function(creep) {
    if (creep.task && creep.task.targets && creep.task.targets[creep.task.tier]) {
        let target = Game.getObjectById(creep.task.targets[creep.task.tier]);
        if (target) {
            if (this.isAssignedTargetValid(target)) {
                this.targetIsClaimed(creep, target);
            }
            else {
                creep.task.targets[creep.task.tier] = null;
            }
        }
    }
};

BaseTask.prototype.taskEnded = function(creep) {
    if (creep.task && creep.task.targets && creep.task.targets[creep.task.tier]) {
        let target = Game.getObjectById(creep.task.targets[creep.task.tier]);
        if (target) {
            this.targetIsReleased(creep, target);
        }
    }
};

BaseTask.prototype.isTaskValid = function(creep, target) {
    return this.isTargetValid(target);
};

BaseTask.prototype.isTargetValid = function(target) {
    return true;
};

BaseTask.prototype.targetIsClaimed = function(creep, target) {
    this.selectPath(creep, target);
};

BaseTask.prototype.targetIsReleased = function(creep, target) {
};

BaseTask.prototype.targetIsInvalid = function(creep, target) {
};

BaseTask.prototype.isAssignedTargetValid = function(target) {
};

BaseTask.prototype.creepHasDied = function(creep) {
};


BaseTask.prototype.selectPath = function(creep, target) {
    if (creep.pos.isEqualTo(this.room.center)) {
        //if the creep is already in the center, move to target using its path
        creep.pathIdx = target.pathIdx;
        creep.pathDir = 1;
    }
    else if (creep.pathIdx != target.pathIdx) {
        //in current design all path changes happen from center.
        //TODO support multiple path changes
        creep.pathDir = -1;
    }
    else {
        //both target and creep are on the same path
        creep.pathIdx = target.pathIdx;
        creep.pathDir = (creep.pathPos > target.pathPos ? -1 : 1);
    }
};

BaseTask.prototype.moveCreep = function(creep, target, dir) {
    _creep.hasMoved = false;
    let pathInfo = this.room.getPath(creep.pathIdx);

    //if creep has reached the end of the path
    if ((creep.pathDir == -1 && creep.pathPos == 0) ||
        (creep.pathDir == 1 && creep.pathPos == pathInfo.path.length - 1)) {
        this.selectPath(creep, target);
    }

    return this.moveCreepInDir(creep);
};

BaseTask.prototype.moveCreepInDir = function(creep, dir = creep.pathDir) {
    let pathInfo = this.room.getPath(creep.pathIdx);
    let path, pos, oldPos = creep.pathPos, canMove = false;
    if (dir == 1) {
        if (this.canMoveCreep(creep, creep.pathPos + 1)) {
            creep.pathPos++;
            path = pathInfo.path;
            pos = creep.pathPos;
            canMove = true;
        }
    }
    else {
        if (this.canMoveCreep(creep, creep.pathPos - 1)) {
            creep.pathPos--;
            path = pathInfo.reverse;
            pos = path.length - creep.pathPos - 1;
            canMove = true;
        }
    }

    if (canMove) {
        //remove creep from old pos
        _.pull(pathInfo.creeps[oldPos], creep.name);
        if (pathInfo.creeps[oldPos].length == 0) {
            delete pathInfo.creeps[oldPos];
        }

        //add creep to new pos
        pathInfo.creeps[pos] = pathInfo.creeps[pos] || [];
        pathInfo.creeps[pos].push(creep.name);

        _creep.hasMoved = true;
        return creep.move(path[pos].direction);
    }
    return constants.ERR_COULDNT_MOVE;
}

BaseTask.prototype.canMoveCreep = function(creep, pathPos) {
    let pathInfo = this.room.getPath(creep.pathIdx);

    if (pathInfo.creeps[pathPos]) {
        return _.every(pathInfo.creeps[pathPos].map(creepName => Game.creeps[creepName]),
                       (_creep) => { return !_creep.hasMoved; });

        for (let i = 0; i < pathInfo.creeps[pathPos].length; i++) {
            let _creep = Game.creeps[pathInfo.creeps[pathPos][i]];

            //if creep has already moved in this tick and took the target pos then another creep cannot be there
            if (_creep.hasMoved) {
                return false;
            }

            //stationary creep. swap positions with creep
            if (_creep.pathDir == 0 && !_creep.swapPos) {
                _creep.swapPos = -creep.pathDir;

                if (_creep.processed) {
                    this.moveCreepInDir(_creep, _creep.swapPos);
                }
            }
        }
    }

    return true;
};

module.exports = BaseTask;
