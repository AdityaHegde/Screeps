import BaseClass from "src/BaseClass";
import Decorators from "src/Decorators";

import plusPattern from "src/data/plusPattern";
import ControllerRoom from "src/ControllerRoom";

@Decorators.memory()
export default class BuildPlanner extends BaseClass {
  public extensionsPattern: any = plusPattern;

  public labsPattern: any = {};

  public wallPattern: any = {};

  public controllerRoom: ControllerRoom;

  @Decorators.inMemory()
  public center: {x: number, y: number};

  @Decorators.costMatrixInMemory()
  public costMatrix: CostMatrix = new PathFinder.CostMatrix();

  constructor(controllerRoom: ControllerRoom) {
    super();

    this.controllerRoom = controllerRoom;
  }

  plan(): boolean {
    // TODO: select dynamically patterns dynamically
    return true;
  }
}
