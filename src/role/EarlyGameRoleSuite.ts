import RoleSuite from "src/role/RoleSuite";
import ControllerRoom from "src/ControllerRoom";

export default class EarlyGameRoleSuite extends RoleSuite {
  static order: Array<string> = ["worker"];
  static creepDistribution: any = null;

  static switchRole(controllerRoom: ControllerRoom) {
    return false;
  }
}