import Decorators from "../Decorators";
import BaseClass from "../BaseClass";
import WorkerCreep from "../WorkerCreep";
import PathPosObject from "./PathPosObject";

import { OK, CREEP_REACHED_TARGET, ERR_COULDNT_MOVE } from "../constants";
import Utils from "../Utils";
import PathManager from "./PathManager";

@Decorators.memory()
export default class PathNavigation extends BaseClass {
  @Decorators.instanceInMemory(PathManager)
  pathManager: PathManager = new PathManager();

  moveCreep(creep: WorkerCreep, target: PathPosObject) {
    creep.currentTarget = target;
    if (creep.hasMoved) {
      return OK;
    }
    creep.hasMoved = false;
    if (this.hasReachedTarget(creep, target)) {
      return CREEP_REACHED_TARGET;
    }
    // if creep has reached its current target pos, find the next path
    if (creep.pathPos === creep.targetPathPos && target && target.pathIdx !== undefined) {
      // if creep was already on the target path,
      if (creep.pathIdx === target.pathIdx) {
        // if the creep has reached target pos, return CREEP_REACHED_TARGET
        if (this.hasReachedTarget(creep, target)) {
          return CREEP_REACHED_TARGET;
        }
      } else if (this.pathManager.pathsInfo.get(creep.pathIdx).isAtConnection(target.pathIdx, creep.pathPos)) {
        // else if creep has reached the pos for its connection to next path, go through next path
        this.pathManager.pathsInfo.get(creep.pathIdx).moveToPath(creep, target);

        // if switching path reached the target, return CREEP_REACHED_TARGET
        // can happen when target on the intersection
        if (this.hasReachedTarget(creep, target)) {
          return CREEP_REACHED_TARGET;
        }
      }

      // if the new pathIdx is the same as target pathIdx, assigne target's pathPos to targetPathPos,
      // else assign the pos for the connection to next path from the new path
      creep.targetPathPos = creep.pathIdx === target.pathIdx ? target.pathPos
        : this.pathManager.pathsInfo.get(creep.pathIdx).connections.get(target.pathIdx).pos;
    }

    let returnValue = this.moveCreepInDir(creep);
    // if the creep will reach the target at the end of this tick, return CREEP_REACHED_TARGET so that it can do its task
    if (this.hasReachedTarget(creep, target)) {
      return CREEP_REACHED_TARGET;
    }
    return returnValue;
  }

  moveCreepInDir(creep: WorkerCreep, dir = creep.targetPathPos - creep.pathPos, skipMoveCheck = false) {
    let pathInfo = this.pathManager.pathsInfo.get(creep.pathIdx);
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
        moveDir = Utils.rotateDirection(creep.movedAway, 4);
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
    return ERR_COULDNT_MOVE;
  }

  // move creeps towards the target away from the path or away from the target towards the path
  // towards = moving towards path
  moveCreepTowards(creep: WorkerCreep, towards = true, skipMoveCheck = false): number {
    // if the creep hasnt already moved, check if it can move away from path at its current pos
    if (!creep.hasMoved && (skipMoveCheck || this.canMoveCreep(creep, creep.pathPos, true))) {
      creep.hasMoved = true;
      creep.movedAway = towards ? 0 : creep.currentTarget.direction;
      creep.movingAway = 0;
      return creep.move(creep.movedAway);
    } else {
      creep.movingAway = towards ? 0 : creep.currentTarget.direction;
      return ERR_COULDNT_MOVE;
    }
  }

  canMoveCreep(creep: WorkerCreep, pathPos, movingAway = false, movingTowards = false) {
    let pathInfo = this.pathManager.pathsInfo.get(creep.pathIdx);

    let creeps = [];

    if (pathInfo.creeps[pathPos]) {
      creeps.push(...pathInfo.creeps[pathPos]);
    }
    pathInfo.directConnections.forEach((connection) => {
      let connectionPathInfo = this.pathManager.pathsInfo.get(connection);
      if (connectionPathInfo.creeps[pathInfo.connections.get(connection).targetPos]) {
        creeps.push(...connectionPathInfo.creeps[pathInfo.connections.get(connection).targetPos]);
      }
    });

    for (let i = 0; i < creeps.length; i++) {
      if (creeps[i] === creep.name) {
        continue;
      }

      let _creep = WorkerCreep.getCreepByName(creeps[i]);

      // creep is moving out of this pos
      if (_creep.processing) {
        continue;
      }

      // if _creep has already moved in this tick and took the target pos then another creep cannot be there
      if (_creep.hasMoved) {
        // if, _creep has not moved away and creep is not moving away,
        //   or _creep has moved to the same direction as creep is trying to move to
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
  }

  hasReachedTarget(creep: WorkerCreep, target: PathPosObject) {
    if (this.hasReachedTargetPos(creep, target)) {
      if (target.direction && !creep.pos.isEqualTo(target.pathPos) && !creep.hasMoved) {
        return this.moveCreepTowards(creep, false) === OK;
      }
      return true;
    }
    return false;
  }

  hasReachedTargetPos(creep: WorkerCreep, target: PathPosObject) {
    return creep.pathIdx === target.pathIdx && creep.pathPos === target.pathPos;
  }

  creepHasDied(creep: WorkerCreep) {
    this.pathManager.pathsInfo.get(creep.pathIdx).removeCreepFromPos(creep);
  }
}
