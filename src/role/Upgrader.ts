import Role from "./Role";
import Decorators from "src/Decorators";
import { Log } from "src/Logger";

@Decorators.memory("roles")
@Log
export default class Upgrader extends Role {
  static creepParts: Array<BodyPartConstant> = [WORK, CARRY, CARRY, MOVE];
  static mainParts: Array<BodyPartConstant> = [WORK];
  static creepTasks = [
    ["withdrawUpgrader"],
    ["upgrade"],
  ];
  static roleName: string = "upgrader";

  init() {}

  getMaxCount() {
    return 1;
  }
}