import Withdraw from "./Withdraw";
import {
  UPGRADER_STORAGE,
  ENERGY_STORED,
  CONTAINER_BUILT
} from "../constants";
import Decorators from "src/Decorators";

@Decorators.memory()
export default class WithdrawUpgrader extends Withdraw {
  static updateTargetEvents: Array<string> = [ENERGY_STORED];
  static updatePotentialTargetEvents: Array<string> = [CONTAINER_BUILT];

  potentialTargetsFilter(structure) {
    return structure.structureType === STRUCTURE_CONTAINER &&
      structure.label === UPGRADER_STORAGE;
  }
}
