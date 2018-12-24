import Build from "./Build";
import { PERIODIC_10_TICKS } from "../constants";
import Decorators from "src/Decorators";

@Decorators.memory()
export default class Repair extends Build {
  static updateTargetEvents: Array<string> = [PERIODIC_10_TICKS];

  updateTargetsMap() {
    this.getTargets().forEach((target) => {
      this.targetsMap[target] = this.targetsMap[target] || 0;
    });
    this.hasTarget = Object.keys(this.targetsMap).length > 0;
  }

  getTargets() {
    return this.controllerRoom.room.find(FIND_STRUCTURES, {
      filter: structure => structure.hits < structure.hitsMax / 2
    }).map((target) => target.id);
  }

  doTask(creep, target) {
    return creep.repair(target);
  }

  isTargetValid(target) {
    return target && target.hits >= target.hitsMax;
  }

  isAssignedTargetValid(target) {
    return (target.hitsMax - target.hits - this.targetsMap[target.id]) > 0;
  }
}
