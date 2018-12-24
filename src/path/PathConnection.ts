import Decorators from "../Decorators";
import BaseClass from "../BaseClass";

@Decorators.memory()
class PathConnection extends BaseClass {
  @Decorators.inMemory()
  idx: number;

  @Decorators.inMemory()
  pos: number;

  @Decorators.inMemory()
  targetPos: number;

  constructor(idx: number, pos: number, targetPos: number) {
    super();
    this.idx = idx;
    this.pos = pos;
    this.targetPos = targetPos;
  }
}

export default PathConnection;
