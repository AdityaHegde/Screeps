import Decorators from "../Decorators";
import { Log } from "src/Logger";
import BaseClass from "src/BaseClass";

@Log
class PathPosObject extends BaseClass {
  @Decorators.inMemory()
  pathIdx: number;

  @Decorators.inMemory()
  pathPos: number;

  @Decorators.inMemory()
  direction: number;

  setPos(pathIdx: number, pathPos: number, direction: number) {
    this.pathIdx = pathIdx;
    this.pathPos = pathPos;
    this.direction = direction;

    return this;
  }
}

export default PathPosObject;
