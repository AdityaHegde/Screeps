import Decorators from "../Decorators";
import PathPosObject from "../path/PathPosObject";

import { PARALLEL_BUILD_COUNT } from "../constants";
import MemoryMap from "src/MemoryMap";
import Building from "src/building/Building";
import Container from "src/building/Container";
import Extension from "src/building/Extension";
import Road from "src/building/Road";
import Tower from "src/building/Tower";
import Wall from "src/building/Wall";
import BuildPlanner from "src/building/BuildPlanner";
import ControllerRoom from "src/ControllerRoom";

const BUILD_TYPES = {};

const BUILDINGS_MAP = {
  "container": Container,
  "extension": Extension,
  "road": Road,
  "spawn": Spawn,
  "tower": Tower,
  "wall": Wall,
};
const BUILD_ORDER = [
  "container",
  "extension",
  "road",
  "spawn",
  "tower",
  "wall",
];

@Decorators.memory()
class BuildManager extends PathPosObject {
  @Decorators.inMemory(() => {})
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
    super();

    this.controllerRoom = controllerRoom;
    this.buildPlanner = new BuildPlanner(controllerRoom);
  }

  build() {
    // check if RCL changed or some structures are yet to be built for current RCL
    // or there are some structures are being built
    if (!this.controllerRoom.tasks.get("build").hasTarget &&
      (this.controllerRoom.controller.level > this.lastLevel || this.cursor < BUILD_ORDER.length)) {
      // reset the cursor when executed for the 1st time RCL changed
      if (this.cursor === BUILD_ORDER.length) {
        this.cursor = 0;
      }

      for (; this.cursor < BUILD_ORDER.length; this.cursor++) {
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
