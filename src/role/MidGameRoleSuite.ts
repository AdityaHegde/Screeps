import RoleSuite from "src/role/RoleSuite";
import ControllerRoom from "src/ControllerRoom";

export default class MidGameRoleSuite extends RoleSuite {
  static order: Array<string> = ["harvester", "hauler", "builder", "upgrader"];
  static creepDistribution: any = {
    worker: ["harvester", "hauler", "builder", "upgrader"]
  };

  static switchRole(controllerRoom: ControllerRoom) {
    return false;
  }
}