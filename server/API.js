const { ScreepsAPI } = require("screeps-api");
const { api } = require("../common/config");

class API {
  constructor() {
    this.api = new ScreepsAPI({
      token: process.env.SCREEPS_TOKEN,
      protocol: api.protocol,
      hostname: api.hostname,
      port: api.port,
      path: api.path
    });
  }

  roomTerrain(room, shard) {
    return this.api.game.roomTerrain(room, 0, shard).then((resp) => {
      return resp.terrain;
    });
  }

  getMemory(segment, shard) {
    return this.api.memory.segment.get(segment, shard).then((resp) => {
      return JSON.parse(resp.data);
    });
  }

  setMemory(segment, data, shard) {
    return this.api.memory.segment.set(segment, JSON.stringify(data), shard);
  }
}

module.exports = API;
