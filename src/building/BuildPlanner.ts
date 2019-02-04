import BaseClass from "src/BaseClass";
import Decorators from "src/Decorators";

import plusPattern from "src/data/plusPattern";
import ControllerRoom from "src/ControllerRoom";
import { Log } from "src/Logger";

@Decorators.memory("buildPlanner")
@Log
export default class BuildPlanner extends BaseClass {
  public extensionsPattern: any = plusPattern;

  public labsPattern: any = {};

  public wallPattern: any = {};

  public controllerRoom: ControllerRoom;

  @Decorators.inMemory(() => {return {x: 0, y: 0}})
  public center: {x: number, y: number};

  // @Decorators.costMatrixInMemory()
  public costMatrix: CostMatrix = new PathFinder.CostMatrix();

  constructor(controllerRoom: ControllerRoom) {
    super(controllerRoom.name);

    this.controllerRoom = controllerRoom;
  }

  plan(): boolean {
    let spawns = this.controllerRoom.room.find(FIND_MY_SPAWNS);
    if (spawns.length === 0) {
      return false;
    }

    this.center.x = spawns[0].pos.x + 1;
    this.center.y = spawns[0].pos.y;
    
    // TODO: select dynamically patterns dynamically
    return true;
  }
}
