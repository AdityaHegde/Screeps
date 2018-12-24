class Room {
  constructor(api, shard, roomName) {
    this.api = api;
    this.shard = shard;
    this.roomName = roomName;

    this.isPending = false;
  }

  async loadData(roomMemory) {
    this.paths = roomMemory.paths || [];

    this.pointsOfInterest = roomMemory.pointsOfInterest || [];

    // paths are a result of planning.
    // pointsOfInterest are needed for planning.
    this.isPending = this.paths.length === 0 && this.pointsOfInterest.length > 0;
  }

  async planRoom() {
    let roomTerrain = await this.api.roomTerrain(this.roomName, 0, this.shard.shardName);

    
  }
}

module.exports = Room;
