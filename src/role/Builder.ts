import Worker from "./Worker";
import Decorators from "src/Decorators";

/**
 * Builder role.
 * @module role
 * @class BuilderRole
 * @extends WorkerRole
 */
@Decorators.memory()
export default class Builder extends Worker {
  static creepParts: Array<BodyPartConstant> = [WORK, CARRY, MOVE, MOVE];
  static mainParts: Array<BodyPartConstant> = [WORK, CARRY];
  static creepTasks = [
    ["withdraw"],
    // let build and repair be managed by the same role,
    // with auto balancing
    ["build", "repair"],
  ];

  getMaxCount() {
    return 2 + this.controllerRoom.tasksInfo.build.hasTarget * 2;
  }
}
