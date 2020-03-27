const { memory, shards } = require("../common/config");

class Planner {
  constructor(api) {
    this.api = api;
  }

  async run() {
    for (let shard = 0; shard < shards; shard++) {
      let roomMemory = await this.api.getMemory(memory.roomMemory, "shard" + shard);

      if (roomMemory) {
      }
    }
  }
}

module.exports = Planner;
