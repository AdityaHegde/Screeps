import Decorators from "./Decorators";

let roomObjects: Map<string, ControllerRoom> = new Map();

@Decorators.memory("name")
class ControllerRoom {
  name: string;

  @Decorators.alias("room.controller")
  controller: StructureController;

  @Decorators.inMemory()
  isInitialized: number = 0;

  public room: Room;

  public tasksInfo: any = {};

  public sourceManager: any = {};

  constructor(name: string) {
    this.name = name;

    this.room = Game.rooms[name];
  }

  tick() {

  }

  init() {
    
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
