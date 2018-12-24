import { Task } from "./Task";
import Decorators from "src/Decorators";

@Decorators.memory()
export default class Upgrade extends Task {
  init(): void {}

  tick(): void {}
  
  getTarget() {
    return this.controllerRoom.room.controller;
  }

  getTargets() {
    return [this.controllerRoom.controller.id];
  }

  doTask(creep, target) {
    return creep.upgradeController(target);
  }

  isTargetValid(target) {
    // TODO
    return true;
  }

  targetsFilter(target: any): boolean {
    return true;
  }

  taskExecuted(creep: any, target: any) {}

  targetIsClaimed(creep: any, target: any): void {}

  targetIsReleased(creep: any, target: any): void {}

  targetIsInvalid(creep: any, target: any): void {}
  
  isAssignedTargetValid(target: any): boolean {
    return true;
  }
}
