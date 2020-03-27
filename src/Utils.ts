import _ from "lodash";

const DIRECTION_TO_OFFSET = {
  [TOP]: [0, -1],
  [TOP_RIGHT]: [1, -1],
  [RIGHT]: [1, 0],
  [BOTTOM_RIGHT]: [1, 1],
  [BOTTOM]: [0, 1],
  [BOTTOM_LEFT]: [-1, 1],
  [LEFT]: [-1, 0],
  [TOP_LEFT]: [-1, -1]
};
const OFFSET_TO_DIRECTION = {
  "0__-1": TOP,
  "1__-1": TOP_RIGHT,
  "1__0": RIGHT,
  "1__1": BOTTOM_RIGHT,
  "0__1": BOTTOM,
  "-1__1": BOTTOM_LEFT,
  "-1__0": LEFT,
  "-1__-1": TOP_LEFT
};
const DIRECTION_TO_PARALLEL_OFFSET = {
  [TOP]: [-1, 0, 1, 0],
  [TOP_RIGHT]: [0, -1, 1, 0],
  [RIGHT]: [0, -1, 0, 1],
  [BOTTOM_RIGHT]: [1, 0, 0, 1],
  [BOTTOM]: [1, 0, -1, 0],
  [BOTTOM_LEFT]: [0, 1, -1, 0],
  [LEFT]: [0, 1, 0, -1],
  [TOP_LEFT]: [-1, 0, 0, -1]
};

class Utils {
  static getParallelOffsetByDirection(direction) {
    return DIRECTION_TO_PARALLEL_OFFSET[direction];
  }

  static getParallelPaths(path) {
    let path0 = [], path1 = [];
    let matrix = {};
    for (let i = 1; i < path.length; i++) {
      let [dx0, dy0, dx1, dy1] = this.getParallelOffsetByDirection(path[i].direction);
      this.addPosToPath(path0, matrix, path[i - 1], path[i + 1], dx0, dy0);
      this.addPosToPath(path1, matrix, path[i - 1], path[i + 1], dx1, dy1);
      if (i < path.length - 1 && path[i].direction !== path[i + 1].direction) {
        if (this.rotateDirection(path[i].direction, 1) === path[i + 1].direction ||
            this.rotateDirection(path[i].direction, 2) === path[i + 1].direction) {
          this.addPosToPath(path0, matrix, path[i], path[i + 1], dx0, dy0);
        } else if (this.rotateDirection(path[i].direction, -1) === path[i + 1].direction ||
                   this.rotateDirection(path[i].direction, -2) === path[i + 1].direction) {
          this.addPosToPath(path1, matrix, path[i], path[i + 1], dx1, dy1);
        }
      }
      matrix[path[i].x + "__" + path[i].y] = 1;
    }

    return [path0, path1];
  }

  static addPosToPath(path, matrix, pos0, pos1, dx, dy) {
    let pos = {
      x: pos0.x + dx,
      y: pos0.y + dy
    };
    if (!matrix[pos.x + "__" + pos.y] &&
        (!pos1 || !this.posEquals(pos1, pos))) {
      path.push(pos);
      matrix[pos.x + "__" + pos.y] = 1;
    }
  }

  static posEquals(pos0, pos1) {
    return pos0.x === pos1.x && pos0.y === pos1.y;
  }

  static getCentroid(points) {
    let x = 0, y = 0;
    points.forEach((point) => {
      x += point.x;
      y += point.y;
    });
    return {
      x: Math.round(x / points.length),
      y: Math.round(y / points.length)
    };
  }

  static getOffsetByDirection(direction) {
    return DIRECTION_TO_OFFSET[direction];
  }

  static rotateDirection(direction, times) {
    let newDirection = ((direction + times - 1) % 8) + 1;
    return newDirection < 0 ? 8 + newDirection : newDirection;
  }

  static sortPositionsByDirection(positions) {
    positions = positions.sort(function (a, b) {
      return a.direction - b.direction;
    });
    for (let i = 1; i < positions.length; i++) {
      if (this.rotateDirection(positions[i - 1].direction, 1) !== positions[i].direction) {
        positions = [...positions.slice(i), ...positions.slice(0, i)];
        break;
      }
    }

    return positions;
  }

  static getReversedPath(path) {
    let lastPos = path[path.length - 1];
    let reversedPath = [{
      x: lastPos.x,
      y: lastPos.y,
      dx: -lastPos.dx,
      dy: -lastPos.dy,
      direction: this.rotateDirection(lastPos.direction, 4)
    }];
    for (let i = path.length - 2; i >= 0; i--) {
      reversedPath.push(this.getNextPathPos(path[i+1], path[i]));
    }
    return reversedPath;
  }

  static getPosByDirection(pos, direction, distance = 1) {
    let offset = this.getOffsetByDirection(direction);
    return new RoomPosition(pos.x + distance * offset[0], pos.y + distance * offset[1], pos.roomName);
  }

  static getPathFromPoints(points) {
    let path = [{
      x: points[0].x,
      y: points[0].y,
      dx: points[0].dx || 0,
      dy: points[0].dy || -1,
      direction: points[0].direction || TOP
    }];
    for (let i = 1; i < points.length; i++) {
      path.push(this.getNextPathPos(points[i-1], points[i]));
    }
    return path;
  }

  static getNextPathPos(pos0, pos1) {
    let dx = pos1.x - pos0.x;
    let dy = pos1.y - pos0.y;
    return {
      x: pos1.x,
      y: pos1.y,
      dx: dx,
      dy: dy,
      direction: OFFSET_TO_DIRECTION[dx + "__" + dy]
    };
  }

  static getDirectionBetweenPos(pos0, pos1) {
    let dx = pos1.x - pos0.x;
    dx = dx > 1 ? 1 : (dx < -1 ? -1 : dx);
    let dy = pos1.y - pos0.y;
    dy = dy > 1 ? 1 : (dy < -1 ? -1 : dy);
    return OFFSET_TO_DIRECTION[dx + "__" + dy];
  }

  static getDistanceBetweenPos(pos0, pos1) {
    //return Math.sqrt((pos0.x - pos1.x) * (pos0.x - pos1.x) + (pos0.y - pos1.y) * (pos0.y - pos1.y));
    return Math.max(Math.abs(pos0.x - pos1.x), Math.abs(pos0.y - pos1.y));
  }

  static getExitByPos(pos) {
    if (pos.x === 0) {
      return LEFT;
    } else if (pos.x === 49) {
      return RIGHT;
    } else if (pos.y === 0) {
      return TOP;
    } else if (pos.y === 49) {
      return BOTTOM;
    }
  }

  static getClosestObject(creep, targets, filterFunction = (target) => { return true; }) {
    let _targets = targets.map((targetId) => {
      return Game.getObjectById(targetId);
    }).filter(filterFunction);
    let min = 9999;
    let minTarget;
    _targets.forEach((target) => {
      let dist = this.getDistanceBetweenPos(creep.pos, target.pos);
      if (dist < min) {
        min = dist;
        minTarget = target;
      }
    });
    return minTarget;
  }

  static getClosestEdge(edges, filterFunction = (target) => { return true; }) {
    return _.minBy(edges.filter(filterFunction), (edge: any) => {
      return this.getDistanceBetweenPos(edge.pos0, edge.pos1);
    });
  }
}

export default Utils;
