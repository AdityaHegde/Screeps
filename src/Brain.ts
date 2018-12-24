import Decorators from "./Decorators";
import ControllerRoom from "./ControllerRoom";

@Decorators.memory()
class Brain {
  @Decorators.inMemory(function () {
    return Object.keys(Game.rooms);
  })

  rooms: Array<string>;

  tick() {
    this.rooms.forEach((roomName) => {
      let room: ControllerRoom = ControllerRoom.getRoomByName(roomName);

      if (room.controller.my) {
        if (room.isInitialized === 2) {
          room.tick();
        } else {
          room.init();
        }

        // if (this.rooms.length > 0) {
        //   let visual = new RoomVisual(room.name);
        //   room.buildPlanner.pathsInfo.forEach((pathInfo) => {
        //     pathInfo.paths.forEach((path) => {
        //       if (path.match(/^\d*:\d*$/)) {
        //         let xy = path.split(":");
        //         visual.circle(Number(xy[0]), Number(xy[1]), {fill : (pathInfo.type === "tower" ? "red" : "white")});
        //       }
        //       else {
        //         path = Room.deserializePath(path);
        //         visual.poly(path, {lineStyle: "dashed"});
        //       }
        //     })
        //   });
        // }
      }
    });
  }
}

export default Brain;
