import Role from "./Role";
import Decorators from "src/Decorators";
import { Log } from "src/Logger";

/**
 * Builder role.
 * @module role
 * @class HarvesterRole
 * @extends BaseRole
 */
@Decorators.memory("roles")
@Log
export default class Harvester extends Role {
  static creepParts: Array<BodyPartConstant> = [WORK, MOVE];
  static mainParts: Array<BodyPartConstant> = [WORK];
  static addMove = false;
  static creepTasks = [
    ["harvestForever"],
  ];
  static roleName: string = "harvester";

  init() {}

  getMaxCount() {
    // have a container for each source and one more for controller
    // hauler will haul from each container to other sources
    return this.controllerRoom.sourceManager.sources.size;
  }

  getMaxParts() {
    // WORK parts = energy available / energy harvested per tick per body / ticks available to work until regen
    return 2 * Math.ceil(SOURCE_ENERGY_CAPACITY / HARVEST_POWER / ENERGY_REGEN_TIME);
  }
}
