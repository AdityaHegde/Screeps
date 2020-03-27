import BaseClass from "src/BaseClass";
import ControllerRoom from "src/ControllerRoom";

export default class RoleSuite extends BaseClass {
  static order: Array<string> = null;
  static creepDistribution: any = null;

  static switchRole(controllerRoom: ControllerRoom) {
    return false;
  }
}
