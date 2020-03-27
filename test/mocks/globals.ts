// let constants = require("./constants-mocks");
// let _ = require("lodash");
// let PathFinder = require("./PathFinder");

import _ from "lodash";
import PathFinder from "./PathFinder";
import constants from "./constants-mocks";

function init(sandbox) {
  global["_"] = _;

  global["Game"] = {
    time : 0,
    cpu : {
      tickLimit : 0,
      getUsed : sandbox.spy(function () {
        //console.log("getUsed", (global["Game"].cpu.getUsed.callCount + 1) * 2);
        return (global["Game"].cpu.getUsed.callCount + 1) * 2;
      }),
    },
    flags : {},
    rooms : {},
    spawns : {},
    creeps : {},
    map : {
      getTerrainAt : sandbox.stub(),
      describeExits : sandbox.stub(),
    },
    getObjectById : sandbox.stub(),
  };

  global["Room"] = sandbox.stub();
  global["Room"].serializePath = sandbox.stub().returnsArg(0);
  global["Room"].deserializePath = sandbox.stub().returnsArg(0);

  global["RoomPosition"] = function (x, y, roomName) {
    this.x = x;
    this.y = y;
    this.roomName = roomName;
  };
  global["RoomPosition"].prototype.isEqualTo = function (pos) {
    return this.x === pos.x && this.y === pos.y;
  };

  global["Creep"] = sandbox.stub();

  global["Memory"] = {};

  global["Source"] = sandbox.stub();

  global["Mineral"] = sandbox.stub();

  global["ConstructionSite"] = sandbox.stub();

  global["StructureContainer"] = sandbox.stub();
  global["StructureExtension"] = sandbox.stub();
  global["StructureSpawn"] = sandbox.stub();
  global["StructureTower"] = sandbox.stub();

  PathFinder(sandbox);

  constants();
}

function updatePrototypes(sandbox, utils) {
  utils.addMemorySupport(global["Room"], "rooms");
  utils.addMemorySupport(global["Creep"], "rooms");
  utils.addMemorySupport(global["Source"], "rooms");
}

function stub() {
  global["Room"].serializePath.returnsArg(0);
  global["Room"].deserializePath.returnsArg(0);
  global["PathFinder"].CostMatrix.prototype.serialize.returnsArg(0);
  global["PathFinder"].CostMatrix.deserialize.returnsArg(0);
}

function resetMemory() {
  global["Memory"] = {};
}

export {
  init,
  updatePrototypes,
  stub,
  resetMemory,
}
