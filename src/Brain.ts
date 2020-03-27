import Decorators from "./Decorators";
import ControllerRoom from "./ControllerRoom";
import BaseClass from "src/BaseClass";
import { Log } from "src/Logger";
import eventBus from "src/EventBus";

@Decorators.memory("brain")
@Log
class Brain extends BaseClass {
  @Decorators.inMemory(function () {
    return Object.keys(Game.rooms);
  })
  rooms: Array<string>;

  tick() {
    eventBus.preTick();

    try {
      this.rooms.forEach((roomName) => {
        let room: Room = Game.rooms[roomName];
  
        this.logger.log("Room:", room && room.name);
  
        if (room && room.controller && room.controller.my) {
          let controllerRoom: ControllerRoom = new ControllerRoom(room);
          controllerRoom.tick();
  
          // if (controllerRoom.buildManager) {
          //   let visual = new RoomVisual(room.name);
          //   controllerRoom.buildManager.buildings.forEach((buildingName, building) => {
          //     building.planned.forEach((plan) => {
          //       visual.circle(plan[0], plan[1], {fill : (building.constructor["visualColor"])});
          //     });
          //   });
          // }
        }
      });
    } catch (err) {
      this.logger.log(err.stack);
    }

    eventBus.postTick();
  }
}

export default Brain;
