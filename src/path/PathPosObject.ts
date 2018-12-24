import Decorators from "../Decorators";

class PathPosObject {
  @Decorators.inMemory()
  pathPos: number;

  @Decorators.inMemory()
  pathIdx: number;

  @Decorators.inMemory()
  direction: number;
}

export default PathPosObject;
