import Decorators from "../Decorators";

import MemoryMap from "src/MemoryMap";
import Building from "src/building/Building";
import Container from "src/building/Container";
import Extension from "src/building/Extension";
import Road from "src/building/Road";
import Tower from "src/building/Tower";
import Wall from "src/building/Wall";
import BuildPlanner from "src/building/BuildPlanner";
import ControllerRoom from "src/ControllerRoom";
import BaseClass from "src/BaseClass";
import { Log } from "src/Logger";
import SpawnBuilding from "src/building/SpawnBuilding";

const BUILDINGS_MAP = {
  "container": Container,
  "extension": Extension,
  "road": Road,
  "spawn": SpawnBuilding,
  "tower": Tower,
  "wall": Wall,
};
const BUILDING_PLAN_ORDER = [
  "extension",
  "spawn",
  "tower",
  "wall",
  "road",
  "container",
];
const BUILD_ORDER = [
  "container",
  "extension",
  "road",
  "spawn",
  "tower",
  "wall",
];

@Decorators.memory("buildManager")
@Log
class BuildManager extends BaseClass {
  @Decorators.inMemory(() => {return {}})
  structureData: any;

  @Decorators.inMemory(() => [])
  buildData: Array<any>;

  @Decorators.inMemory(() => 0)
  cursor: number;

  @Decorators.inMemory(() => 0)
  pathCursor: number;

  @Decorators.inMemory(() => 0)
  posCursor: number;

  @Decorators.inMemory(() => 0)
  lastLevel: number;

  @Decorators.instancePolymorphMapInMemory(BUILDINGS_MAP)
  buildings: MemoryMap<string, Building>;

  buildPlanner: BuildPlanner;

  controllerRoom: ControllerRoom;

  constructor(controllerRoom: ControllerRoom) {
    super(controllerRoom.name);

    this.controllerRoom = controllerRoom;
    this.buildPlanner = new BuildPlanner(controllerRoom);

    for (const buildingName in BUILDINGS_MAP) {
      if (BUILDINGS_MAP.hasOwnProperty(buildingName)) {
        const BuildingClass = BUILDINGS_MAP[buildingName];
        this.buildings.set(buildingName, new BuildingClass(controllerRoom.name + "_" + buildingName));
      }
    }
  }

  plan(): boolean {
    if (!this.buildPlanner.plan()) {
      return false;
    }

    this.controllerRoom.sourceManager.addSources();

    BUILDING_PLAN_ORDER.forEach((buildingName) => {
      let building = this.buildings.get(buildingName);
      building.plan(this.buildPlanner);
    });

    return true;
  }

  build() {
    this.logger.log("Building", this.cursor);
    // check if RCL changed or some structures are yet to be built for current RCL
    // or there are some structures are being built
    if (!this.controllerRoom.tasks.get("build").hasTarget &&
      (this.controllerRoom.controller.level > this.lastLevel || this.cursor < BUILD_ORDER.length)) {
      // reset the cursor when executed for the 1st time RCL changed
      if (this.cursor === BUILD_ORDER.length) {
        this.cursor = 0;
      }

      for (; this.cursor < BUILD_ORDER.length; this.cursor++) {
        this.logger.log("Building", BUILD_ORDER[this.cursor]);
        if (!this.buildings.get(BUILD_ORDER[this.cursor]).build(this.buildPlanner)) {
          break;
        }
        // else if the current building has no pending entries to be built, check next
      }

      if (this.cursor === this.buildData.length) {
        // proceed only if all structures for this level are built
        this.lastLevel = this.controllerRoom.controller.level;
      }
    }
  }
}

export default BuildManager;
