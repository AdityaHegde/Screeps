import PathPosObject from "./path/PathPosObject";
import Decorators from "./Decorators";
import { Log } from "src/Logger";

let creepObjects: Map<string, CreepWrapper> = new Map();

@Decorators.memory("creeps", "name")
@Log
export default class CreepWrapper extends PathPosObject {
  public name: string;

  private creep: Creep;

  @Decorators.inMemory()
  role: any;

  @Decorators.inMemory()
  task: any;

  @Decorators.alias("creep.pos")
  pos: RoomPosition;

  @Decorators.alias("creep.carry")
  carry: any;

  @Decorators.alias("creep.carryCapacity")
  carryCapacity: number;

  @Decorators.alias("creep.spawning")
  spawning: number;

  processed: boolean = false;

  constructor(name: string) {
    super();
    this.name = name;

    this.creep = Game.creeps[name];
  }

  //Wrappers
  move(direction: number) {
    return this.creep.move(direction as any);
  }

  moveTo(target, opts?) {
    return this.creep.moveTo(target, opts);
  }

  build(target) {
    return this.creep.build(target);
  }

  harvest(target) {
    return this.creep.harvest(target);
  }

  transfer(target, resourceType: ResourceConstant, amount?: number) {
    return this.creep.transfer(target, resourceType, amount);
  }

  withdraw(target, resourceType: ResourceConstant, amount?: number) {
    return this.creep.withdraw(target, resourceType, amount);
  }

  repair(target) {
    return this.creep.repair(target);
  }

  upgradeController(target) {
    return this.creep.upgradeController(target);
  }

  suicide() {
    return this.creep.suicide();
  }

  static getCreepByName(creepName: string): CreepWrapper {
    let creep: CreepWrapper;
    if (creepObjects.has(creepName)) {
      creep = creepObjects.get(creepName);
    } else {
      creep = new this(creepName);
      creepObjects.set(creepName, creep);
    }
    return creep;
  }

  static clearObjects() {
    creepObjects = new Map();
  }
}
