import Decorators from "src/Decorators";
import PathPosObject from "src/path/PathPosObject";
import ControllerRoom from "src/ControllerRoom";
import { Log } from "src/Logger";

let sourceWrapperObjects: Map<string, SourceWrapper> = new Map();

@Decorators.memory("sources")
@Log
export default class SourceWrapper extends PathPosObject {
  @Decorators.inMemory()
  spaces: any;

  @Decorators.inMemory()
  occupiedSpaces: any;

  @Decorators.inMemory()
  creepCount: number;

  @Decorators.instanceInMemory()
  source: Source;

  controllerRoom: ControllerRoom;

  constructor(id: string, controllerRoom: ControllerRoom) {
    super(id);

    this.controllerRoom = controllerRoom;
  }

  setSource(source: Source) {
    this.source = source;
    return this;
  }

  init() {
    // this.pathData is set during planning of roads
    // let path = this.controllerRoom.pathManager.pathsInfo[this.pathIdx].path;
    this.logger.log(`${this.source} - ${this.source && this.source.pos}`);

    let spaces = [], sourcePath = [];
    let roomTerrain: RoomTerrain = Game.map.getRoomTerrain(this.source.room.name);
    for (let x = this.source.pos.x - 1; x <= this.source.pos.x + 1; x++) {
      for (let y = this.source.pos.y - 1; y <= this.source.pos.y + 1; y++) {
        if (roomTerrain.get(x, y) !== TERRAIN_MASK_WALL) {
          spaces.push({
            x,
            y,
            // direction: Utils.getDirectionBetweenPos(this.source.pos, {x, y}),
            count: 0,
          });
        }
      }
    }
    // spaces = Utils.sortPositionsByDirection(spaces);

    let intersectionPos;

    // spaces.forEach((space, i) => {
    //   let pos1 = Utils.getPosByDirection(this.source.pos, space.direction);
    //   let pos2 = Utils.getPosByDirection(pos1, space.direction);
    //   // path.length - 1 is the position of source,
    //   // path.length - 2 will be the position of container,
    //   // path.length - 3 will be the connection to the path around the source
    //   if (pos2.isEqualTo(path[path.length - 3])) {
    //     intersectionPos = sourcePath.length;
    //   }
    //   sourcePath.push(pos2);

    //   if (i < spaces.length - 1) {
    //     pos2 = Utils.getPosByDirection(pos2,
    //       Utils.rotateDirection(space.direction, 2 + ((space.direction % 2 === 0) ? 0: 1)));
    //     if (pos2.isEqualTo(path[path.length - 3])) {
    //       intersectionPos = sourcePath.length;
    //     }
    //     sourcePath.push(pos2);
    //   }

    //   space.pathIdx = this.controllerRoom.pathManager.pathsInfo.size;
    //   space.pathPos = (i < spaces.length - 1) ? sourcePath.length - 2 : sourcePath.length - 1;
    // });

    // this.controllerRoom.pathManager.addPath(Utils.getPathFromPoints(sourcePath), {
    //   [this.pathIdx]: {
    //     fromPos: path.length - 3,
    //     toPos: intersectionPos
    //   }
    // });

    this.spaces = spaces;
    this.occupiedSpaces = [];
  }

  claim(creep, idx) {
    this.spaces[idx].count++;
    creep.task.source = this.source.id;
    creep.task.space = idx;
    return this.source;
  }

  release(creep) {
    this.spaces[creep.task.space].count--;
    delete creep.task.source;
    delete creep.task.space;
    return this.source;
  }

  static getSourceWrapperById(id: string, controllerRoom: ControllerRoom): SourceWrapper {
    let sourceWrapper: SourceWrapper;
    if (sourceWrapperObjects.has(id)) {
      sourceWrapper = sourceWrapperObjects.get(id);
    } else {
      sourceWrapper = new SourceWrapper(id, controllerRoom);
      sourceWrapperObjects.set(id, sourceWrapper);
    }
    return sourceWrapper;
  }
}
