import WorkerRole from "./WorkerRole";
import Decorators from "src/Decorators";
import { Log } from "src/Logger";

/**
 * Builder role.
 * @module role
 * @class BuilderRole
 * @extends WorkerRole
 */
@Decorators.memory("roles")
@Log
export default class Builder extends WorkerRole {
  static creepParts: Array<BodyPartConstant> = [WORK, CARRY, MOVE, MOVE];
  static mainParts: Array<BodyPartConstant> = [WORK, CARRY];
  static creepTasks = [
    ["withdraw"],
    // let build and repair be managed by the same role,
    // with auto balancing
    ["build", "repair"],
  ];
  static roleName: string = "builder";

  getMaxCount() {
    return 2 + (this.controllerRoom.tasks.get("build").hasTarget ? 2 : 0);
  }
}
