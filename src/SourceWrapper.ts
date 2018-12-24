import BaseClass from "src/BaseClass";
import Decorators from "src/Decorators";
import Utils from "src/Utils";

@Decorators.memory()
export default class SourceWrapper extends BaseClass {
  @Decorators.inMemory()
  spaces: any;

  @Decorators.inMemory()
  occupiedSpaces: any;

  @Decorators.inMemory()
  creepCount: number;

  // TODO: hook this up
  source: Source;

  init() {
    // this.pathData is set during planning of roads
    let path = this.room.pathManager.pathsInfo[this.pathIdx].path;
  
    let spaces = [], sourcePath = [];
    for (let x = this.source.pos.x - 1; x <= this.source.pos.x + 1; x++) {
      for (let y = this.source.pos.y - 1; y <= this.source.pos.y + 1; y++) {
        if (Game.map.getTerrainAt(x, y, this.source.room.name) !== "wall") {
          spaces.push({
            x,
            y,
            direction: Utils.getDirectionBetweenPos(this.source.pos, {x, y}),
            count: 0
          });
        }
      }
    }
    spaces = Utils.sortPositionsByDirection(spaces);
  
    let intersectionPos;
  
    spaces.forEach((space, i) => {
      let pos1 = Utils.getPosByDirection(this.source.pos, space.direction);
      let pos2 = Utils.getPosByDirection(pos1, space.direction);
      // path.length - 1 is the position of source,
      // path.length - 2 will be the position of container,
      // path.length - 3 will be the connection to the path around the source
      if (pos2.isEqualTo(path[path.length - 3])) {
        intersectionPos = sourcePath.length;
      }
      sourcePath.push(pos2);
  
      if (i < spaces.length - 1) {
        pos2 = Utils.getPosByDirection(pos2,
          Utils.rotateDirection(space.direction, 2 + ((space.direction % 2 === 0) ? 0: 1)));
        if (pos2.isEqualTo(path[path.length - 3])) {
          intersectionPos = sourcePath.length;
        }
        sourcePath.push(pos2);
      }
  
      space.pathIdx = this.room.pathManager.size;
      space.pathPos = (i < spaces.length - 1) ? sourcePath.length - 2 : sourcePath.length - 1;
    });
  
    this.room.pathManager.addPath(Utils.getPathFromPoints(sourcePath), {
      [this.pathIdx]: {
        fromPos: path.length - 3,
        toPos: intersectionPos
      }
    });

    this.spaces = spaces;
    this.occupiedSpaces = [];
  }

  claim(creep, idx) {
    this.spaces[idx].count++;
    creep.task.source = this.id;
    creep.task.space = idx;
    return this;
  }

  release(creep) {
    this.spaces[creep.task.space].count--;
    delete creep.task.source;
    delete creep.task.space;
    return this;
  }
}
