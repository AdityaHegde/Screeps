import Role from "./Role";
import Decorators from "src/Decorators";

@Decorators.memory()
export default class Upgrader extends Role {
  static creepParts: Array<BodyPartConstant> = [WORK, CARRY, CARRY, MOVE];
  static mainParts: Array<BodyPartConstant> = [WORK];
  static creepTasks = [
    ["withdrawUpgrader"],
    ["upgrade"],
  ];

  init() {}

  getMaxCount() {
    return 1;
  }
}