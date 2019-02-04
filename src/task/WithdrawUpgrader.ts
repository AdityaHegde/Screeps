import Withdraw from "./Withdraw";
import {
  UPGRADER_STORAGE,
  ENERGY_STORED,
  CONTAINER_BUILT
} from "../constants";
import Decorators from "src/Decorators";
import { Log } from "src/Logger";

@Decorators.memory("tasks")
@Log
export default class WithdrawUpgrader extends Withdraw {
  static taskName: string = "withdrawUpgrader";
  static updateTargetEvents: Array<string> = [ENERGY_STORED];
  static updatePotentialTargetEvents: Array<string> = [CONTAINER_BUILT];

  potentialTargetsFilter(structure) {
    return structure.structureType === STRUCTURE_CONTAINER &&
      structure.label === UPGRADER_STORAGE;
  }
}
