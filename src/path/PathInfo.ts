import Decorators from "../Decorators";
import PathConnection from "./PathConnection";
import Utils from "../Utils";
import BaseClass from "../BaseClass";
import MemoryMap from "../MemoryMap";
import * as _ from "lodash";
import { Log } from "src/Logger";
import WorkerCreep from "src/WorkerCreep";
import PathPosObject from "src/path/PathPosObject";

@Decorators.memory("pathsInfo")
@Log
class PathInfo extends BaseClass {
  @Decorators.pathInMemory()
  path;

  @Decorators.pathInMemory()
  reverse;

  @Decorators.inMemory(() => {return {}})
  creeps;

  @Decorators.instanceMapInMemory(PathConnection)
  connections: MemoryMap<string | number, PathConnection>;

  @Decorators.inMemory(() => [])
  directConnections;

  constructor(id) {
    super(id);
  }

  setPath(path) {
    this.path = path;
    this.reverse = Utils.getReversedPath(path);

    return this;
  }

  populatePathsMatrix(pathsMatrix) {
    this.path.forEach((pos, i) => {
      let key = pos.x + "__" + pos.y;
      pathsMatrix[key] = pathsMatrix[key] || {};
      pathsMatrix[key][this.id] = i;
    });
  }

  addCreepToPos(creep: WorkerCreep, pos = creep.pathPos) {
    this.creeps[pos] = this.creeps[pos] || [];
    this.creeps[pos].push(creep.name);
  }

  removeCreepFromPos(creep: WorkerCreep, pos = creep.pathPos) {
    if (this.creeps[pos]) {
      _.pull(this.creeps[pos], creep.name);
      if (this.creeps[pos].length === 0) {
        delete this.creeps[pos];
      }
    }
  }

  isAtConnection(targetPathIdx: number, curPos: number) {
    return this.connections.has(targetPathIdx) &&
      this.connections.get(targetPathIdx).pos === curPos;
  }
}

export default PathInfo;
