import PathPosObject from "./path/PathPosObject";
import Decorators from "./Decorators";

let creepObjects: Map<string, CreepWrapper> = new Map();

@Decorators.memory("name")
export default class CreepWrapper extends PathPosObject {
  public name: string;

  creep: Creep;

  @Decorators.inMemory()
  role: any;

  @Decorators.inMemory()
  task: any;

  constructor(name: string) {
    super();
    this.name = name;

    this.creep = Game.creeps[name];
  }

  move(direction: number) {
    return this.creep.move(direction as any);
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
}
