import Harvest from "./Harvest";
import Decorators from "src/Decorators";

@Decorators.memory()
export default class HarvestForever extends Harvest {
  static eventListeners = [];
  static updateTargetEvents = [];

  isTaskValid(creep, target) {
    return true;
  }

  getTargetForMovement(creep, target) {
    return target;
  }
}
