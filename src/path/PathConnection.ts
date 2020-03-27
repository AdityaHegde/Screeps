import Decorators from "../Decorators";
import BaseClass from "../BaseClass";
import { Log } from "src/Logger";

@Decorators.memory("pathConnections")
@Log
class PathConnection extends BaseClass {
  @Decorators.inMemory()
  idx: number;

  @Decorators.inMemory()
  pos: number;

  @Decorators.inMemory()
  targetPos: number;

  setPos(idx: number, pos: number, targetPos: number) {
    this.idx = idx;
    this.pos = pos;
    this.targetPos = targetPos;

    return this;
  }
}

export default PathConnection;
