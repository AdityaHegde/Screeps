const { memory } = require("../common/config");
const Room = require("./Room");
const _ = require("lodash");
const Promise = require("promise");

class Shard {
  constructor(api, shardName) {
    this.api = api;
    this.shardName = shardName;

    this.rooms = {};
  }

  async loadData() {
    let roomsMemory = await this.api.getMemory(memory.roomsSegment, this.shardName);

    if (roomMemory) {
      if (roomMemory.rooms) {
        for (let roomName in roomsMemory.rooms) {
          let room = new Room(this.api, this, roomName);
          await room.loadData(roomsMemory.rooms[roomName]);
          this.rooms[roomName] = room;
        }
      }
    }

    await Promise.all(
      ..._.values(this.rooms).filter(room => room.isPending).map(room => room.planRoom())
    );
  }
}

module.exports = Shard;
