import Decorators from "../Decorators";
import BaseClass from "../BaseClass";
import _ from "lodash";
import PathInfo from "./PathInfo";
import MemoryMap from "../MemoryMap";
import PathConnection from "./PathConnection";
import { Log } from "src/Logger";
import PathNavigation from "src/path/PathNavigation";

function getPathIdxs (pathsMatrix, key) {
  return _.map(_.keys(pathsMatrix[key]), (idx) => {
    return {
      idx: idx,
      pos: pathsMatrix[key][idx]
    };
  });
}

@Decorators.memory("pathManager")
@Log
class PathManager extends BaseClass {
  @Decorators.instanceMapInMemory(PathInfo)
  public pathsInfo: MemoryMap<string | number, PathInfo>;

  @Decorators.inMemory()
  private size: number;

  @Decorators.inMemory(() => {return {}})
  private pathsMatrix: any;

  @Decorators.inMemory()
  private pathIdxsByExit: any;

  @Decorators.inMemory()
  private wallPathIdxsByExit: any;

  public pathNavigation: PathNavigation;

  constructor(id: string) {
    super(id);

    this.pathNavigation = new PathNavigation(id, this);
  }

  public addPath(path): Array<PathInfo> {
    this.logger.logJSON(path);
    let dedupedPathParts = this.dedupePathParts(path);
    let pathInfos;

    return dedupedPathParts.map((pathPart) => {
      return this.addPathPart(pathPart);
    });
  }

  private addPathPart(pathPart): PathInfo {
    this.logger.logJSON(pathPart);
    let pathInfo = new PathInfo(this.size++).setPath(pathPart.path);
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
      if (i !== pathInfo.id as any) {
        let pathInfoEntry = this.pathsInfo.get(i);
        if (connections[i]) {
          // TODO find the shorter connection for multiple paths
          pathInfoEntry.connections.forEach((j) => {
            if (pathInfoEntry.connections.get(j).idx === Number(j)) {
              onePathConnection[j] = i;
            }
            else if (!(j in onePathConnection)) {
              onePathConnection[j] = i;
            }
          });

          pathInfo.connections.set(i,
            new PathConnection().setPos(i, connections[i].toPos, connections[i].fromPos));
          pathInfo.directConnections.push(i);
          pathInfoEntry.connections.set(pathInfo.id,
            new PathConnection().setPos(Number(pathInfo.id), connections[i].fromPos, connections[i].toPos));
            pathInfoEntry.directConnections.push(pathInfo.id);
        } else {
          noConnections[i] = 1;
        }

        // if count of registered connections is less than paths - path i - new path,
        // there is an island
        if (pathInfoEntry.connections.size < this.size - 2) {
          islands[i] = pathInfoEntry.connections.size;
        }
      }
    }

    // console.log(pathInfo.id, noConnections, onePathConnection, islands);

    for (let i in noConnections) {
      if (i in onePathConnection) {
        let pathInfoEntry = this.pathsInfo.get(i);
        pathInfo.connections.set(i, pathInfo.connections.get(onePathConnection[i]));
        pathInfoEntry.connections.set(pathInfo.id, pathInfoEntry.connections.get(onePathConnection[i]));
      }
    }

    for (let i in islands) {
      // if count of registered connections on this path greater than islands,
      // this is connections between islands
      if (pathInfo.connections.size > islands[i]) {
        let pathInfoIEntry = this.pathsInfo.get(i);
        for (let j in pathInfo.connections.keys()) {
          let pathInfoJEntry = this.pathsInfo.get(j);
          if (!pathInfoIEntry.connections.has(j) && i !== j) {
            pathInfoIEntry.connections.set(j, pathInfoIEntry.connections.get(pathInfo.id));
            pathInfoJEntry.connections.set(i, pathInfoJEntry.connections.get(pathInfo.id));
          }
        }
      }
    }

    this.pathsInfo.set(pathInfo.id, pathInfo);

    return pathInfo;
  }

  // if there is parts of the path common to other paths already registered,
  // split them up and add them as seperate paths deduping those parts
  private dedupePathParts(path) {
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
        let commonIdxs: Array<any> = _.intersection(
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
    //   console.log(pathPart);
    // });
  
    return pathParts;
  }
}

export default PathManager;
