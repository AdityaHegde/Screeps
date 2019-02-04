import { Task } from "./Task";
import Decorators from "src/Decorators";
import { Log } from "src/Logger";
import CreepWrapper from "src/CreepWrapper";

@Decorators.memory("tasks")
@Log
export default class Upgrade extends Task {
  static taskName: string = "upgrade";

  tick(): void {}
  
  getTarget() {
    return this.controllerRoom.room.controller;
  }

  getTargets() {
    return [this.controllerRoom.controller.id];
  }

  doTask(creep: CreepWrapper, target) {
    return creep.upgradeController(target);
  }

  isTargetValid(target) {
    // TODO
    return true;
  }

  targetsFilter(target: any): boolean {
    return true;
  }

  taskExecuted(creep: CreepWrapper, target: any) {}

  targetIsClaimed(creep: CreepWrapper, target: any): void {}

  targetIsReleased(creep: CreepWrapper, target: any): void {}

  targetIsInvalid(creep: CreepWrapper, target: any): void {}
  
  isAssignedTargetValid(target: any): boolean {
    return true;
  }

  isNearTarget(creep: CreepWrapper, target): boolean {
    return creep.pos.inRangeTo(target, 2);
  }
}
