import Decorators from "./Decorators";
import SourceManager from "src/SourceManager";
import PathManager from "src/path/PathManager";
import BuildManager from "src/building/BuildManager";
import BuildPlanner from "src/building/BuildPlanner";
import {
  ROOM_STATE_UNOCCUPIED,
  ROOM_STATE_UNDEVELOPED,
  ROOM_STATE_UNINITIALIZED,
  ROOM_STATE_INITIALIZED
} from "src/constants";
import MemoryMap from "src/MemoryMap";
import { Task } from "src/task/Task";
import { Log, Logger } from "src/Logger";
import RoleManager from "src/role/RoleManager";
import Build from "src/task/Build";
import Dropoff from "src/task/Dropoff";
import Harvest from "src/task/Harvest";
import Repair from "src/task/Repair";
import Store from "src/task/Store";
import Supply from "src/task/Supply";
import Upgrade from "src/task/Upgrade";
import Withdraw from "src/task/Withdraw";
import HarvestForever from "src/task/HarvestForever";
import WithdrawUpgrader from "src/task/WithdrawUpgrader";

let roomObjects: Map<string, ControllerRoom> = new Map();

const TASKS_MAP = {
  [Build.taskName]: Build,
  [Dropoff.taskName]: Dropoff,
  [Harvest.taskName]: Harvest,
  [HarvestForever.taskName]: HarvestForever,
  [Repair.taskName]: Repair,
  [Store.taskName]: Store,
  [Supply.taskName]: Supply,
  [Upgrade.taskName]: Upgrade,
  [Withdraw.taskName]: Withdraw,
  [WithdrawUpgrader.taskName]: WithdrawUpgrader,
};

for (const taskName in TASKS_MAP) {
  if (TASKS_MAP.hasOwnProperty(taskName)) {
    TASKS_MAP[taskName].initClass();
  }
}

@Decorators.memory("rooms", "name")
@Log
class ControllerRoom {
  name: string;

  logger: Logger;

  @Decorators.alias("room.controller")
  controller: StructureController;

  // TODO: extract this
  mineral: Mineral;

  @Decorators.inMemory(() => ROOM_STATE_UNOCCUPIED)
  state: string;

  public room: Room;

  @Decorators.instancePolymorphMapInMemory(TASKS_MAP)
  public tasks: MemoryMap<string, Task>;

  public sourceManager: SourceManager;

  public pathManager: PathManager;

  public buildManager: BuildManager;

  public roleManager: RoleManager;

  constructor(room: Room) {
    this.name = room.name;
    this.room = room;

    for (const taskName in TASKS_MAP) {
      if (TASKS_MAP.hasOwnProperty(taskName)) {
        const TaskClass = TASKS_MAP[taskName];
        this.tasks.set(taskName,
          new TaskClass(this.name + "_" + taskName)
            .setControllerRoom(this));
      }
    }

    this.sourceManager = new SourceManager(this);
    this.pathManager = new PathManager(this.name);
    this.buildManager = new BuildManager(this);
    this.roleManager = new RoleManager(this);
    this.roleManager.initCurRoles();
  }

  tick() {
    this.logger.log("State:", this.state);
    switch (this.state) {
      case ROOM_STATE_UNOCCUPIED:
      case ROOM_STATE_UNDEVELOPED:
        this.state = ROOM_STATE_UNINITIALIZED;
      case ROOM_STATE_UNINITIALIZED:
        if (this.buildManager.plan()) {
          this.state = ROOM_STATE_INITIALIZED;

          for (const taskName in TASKS_MAP) {
            if (TASKS_MAP.hasOwnProperty(taskName)) {
              this.tasks.get(taskName).init();
            }
          }
        }
        break;

      case ROOM_STATE_INITIALIZED:
        this.buildManager.build();
        this.roleManager.tick();
        break;
    }
  }

  static getRoomByRoomName(roomName: string): ControllerRoom {
    return this.getRoomByRoomInstance(Game.rooms[roomName]);
  }

  static getRoomByRoomInstance(room: Room): ControllerRoom {
    let controllerRoom: ControllerRoom;
    if (roomObjects.has(room.name)) {
      controllerRoom = roomObjects.get(room.name);
    } else {
      controllerRoom = new ControllerRoom(room);
      roomObjects.set(room.name, controllerRoom);
    }
    return controllerRoom;
  }
}

export default ControllerRoom;
