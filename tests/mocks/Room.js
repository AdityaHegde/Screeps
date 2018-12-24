let Source = require("./Source");
let StructureController = require("./StructureController");

module.exports = function (sandbox, roomData, roomName) {
  this.name = roomName;
  this.table = [];

  for (let i = 0; i < 50; i++) {
    this.table.push([]);
    for (let j = 0; j < 50; j++) {
      this.table[i].push([]);

      let addPlain = true;

      if (roomData[i] && roomData[i][j]) {
        switch (roomData[i][j]) {
          case "wall":
          case "sawmp":
            this.table[i][j].push({
              type : "terrain",
              terrain : roomData[i][j],
            });
            addPlain = false;
            break;

          case "source":
            this.table[i][j].push({
              type : "source",
              source : new Source(i, j, roomName),
            });
            break;

          case "controller":
            this.table[i][j].push({
              type : "controller",
              source : new StructureController(i, j, roomName),
            });
            break;
        }
      }

      if (addPlain) {
        this.table[i][j].push({
          type : "terrain",
          terrain : "plain",
        });
      }
    }
  }
};
