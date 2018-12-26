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

let roomObjects: Map<string, ControllerRoom> = new Map();

const TASKS_MAP = {

};

@Decorators.memory("name")
class ControllerRoom {
  name: string;

  @Decorators.alias("room.controller")
  controller: StructureController;
  
  // TODO: extract this
  mineral: Mineral;

  @Decorators.inMemory()
  state: string = ROOM_STATE_UNOCCUPIED;

  public room: Room;

  @Decorators.instancePolymorphMapInMemory(TASKS_MAP)
  public tasks: MemoryMap<string, Task>;

  public sourceManager: SourceManager;

  public pathManager: PathManager;

  public buildManager: BuildManager;

  public buildPlanner: BuildPlanner;

  constructor(name: string) {
    this.name = name;

    this.room = Game.rooms[name];

    this.sourceManager = new SourceManager(this);
    this.pathManager = new PathManager();
    this.buildManager = new BuildManager(this);
    this.buildPlanner = new BuildPlanner(this);
  }

  tick() {
    switch (this.state) {
      case ROOM_STATE_UNOCCUPIED:
      case ROOM_STATE_UNDEVELOPED:
        this.state = ROOM_STATE_UNINITIALIZED;
      case ROOM_STATE_UNINITIALIZED:
        if (this.buildPlanner.plan()) {
          this.state = ROOM_STATE_INITIALIZED;
        }

        this.sourceManager.addSources();
        this.sourceManager.initSources();
        break;

      case ROOM_STATE_INITIALIZED:
        this.buildManager.build();
        break;
    }
  }

  static getRoomByName(roomName: string): ControllerRoom {
    let room: ControllerRoom;
    if (roomObjects.has(roomName)) {
      room = roomObjects.get(roomName);
    } else {
      room = new ControllerRoom(roomName);
      roomObjects.set(roomName, room);
    }
    return room;
  }
}

export default ControllerRoom;
