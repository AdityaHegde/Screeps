import Harvest from "./Harvest";
import Decorators from "src/Decorators";
import { Log } from "src/Logger";
import CreepWrapper from "src/CreepWrapper";

@Decorators.memory("tasks")
@Log
export default class HarvestForever extends Harvest {
  static taskName: string = "harvestForever";
  static eventListeners = [];
  static updateTargetEvents = [];

  isTaskValid(creep: CreepWrapper, target) {
    return true;
  }

  getTargetForMovement(creep: CreepWrapper, target) {
    return target;
  }
}
