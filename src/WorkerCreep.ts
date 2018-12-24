import Decorators from "./Decorators";
import PathPosObject from "./path/PathPosObject";
import CreepWrapper from "./CreepWrapper";

export default class WorkerCreep extends CreepWrapper {
  @Decorators.inMemory()
  task: any;

  @Decorators.inMemory(() => 0)
  movedAway: number;

  @Decorators.inMemory(() => 0)
  movingAway: number;

  @Decorators.inMemory(() => 0)
  targetPathPos: number;

  currentTarget: PathPosObject;
  hasMoved: boolean;
  processed: boolean;
  processing: boolean;
  swapPos: number;

  @Decorators.alias("creep.pos")
  pos: any;

  static getCreepByName(creepName: string): WorkerCreep {
    return super.getCreepByName(creepName) as WorkerCreep;
  }
}
