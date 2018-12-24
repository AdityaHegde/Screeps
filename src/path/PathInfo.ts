import Decorators from "../Decorators";
import PathConnection from "./PathConnection";
import Utils from "../Utils";
import BaseClass from "../BaseClass";
import MemoryMap from "../MemoryMap";
import * as _ from "lodash";

@Decorators.memory()
class PathInfo extends BaseClass {
  @Decorators.pathInMemory()
  path;

  @Decorators.pathInMemory()
  reverse;

  @Decorators.pathInMemory()
  parallelPath0;

  @Decorators.pathInMemory()
  parallelPath1;

  @Decorators.inMemory()
  creeps;

  @Decorators.instanceMapInMemory(PathConnection)
  connections: MemoryMap<string | number, PathConnection>;

  @Decorators.inMemory(() => [])
  directConnections;

  constructor(id, path, findParallelPaths = false) {
    super(id);
    this.path = path;
    this.reverse = Utils.getReversedPath(path);
    if (findParallelPaths) {
      [this.parallelPath0, this.parallelPath1] = Utils.getParallelPaths(path);
    }
  }

  populatePathsMatrix(pathsMatrix) {
    this.path.forEach((pos, i) => {
      let key = pos.x + "__" + pos.y;
      pathsMatrix[key] = pathsMatrix[key] || {};
      pathsMatrix[key][this.id] = i;
    });
  }

  addCreepToPos(creep, pos = creep.pathPos) {
    this.creeps[pos] = this.creeps[pos] || [];
    this.creeps[pos].push(creep.name);
  }

  removeCreepFromPos(creep, pos = creep.pathPos) {
    if (this.creeps[pos]) {
      _.pull(this.creeps[pos], creep.name);
      if (this.creeps[pos].length === 0) {
        delete this.creeps[pos];
      }
    }
  }

  isAtConnection(targetPathIdx: number, curPos: number) {
    return this.connections.get(targetPathIdx).pos === curPos;
  }

  moveToPath(creep, target) {
    let targetPath = this.connections.get(target.pathIdx);
    this.removeCreepFromPos(creep);
    creep.pathPos = targetPath.targetPos;
    creep.pathIdx = targetPath.idx;
    this.addCreepToPos(creep);
  }
}

export default PathInfo;
