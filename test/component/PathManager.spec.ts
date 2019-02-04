import "mocha";

import * as sinon from "sinon";
import * as should from "should";
import testUtils from "test/testUtils";

import { init, stub } from "../mocks/globals";

let sandbox = sinon.createSandbox();
init(sandbox);

import PathManager from "src/path/PathManager";
import WorkerCreep from "src/WorkerCreep";
import PathPosObject from "src/path/PathPosObject";
import Decorators from "src/Decorators";
import CreepWrapper from "src/CreepWrapper";

@Decorators.memory("pathPosObjs")
class CreepTarget extends PathPosObject {}

function createWorkerCreep(name: string, pathIdx, pathPos, targetPathPos) {
  let workerCreep = WorkerCreep.getCreepByName(name);
  try {
    sandbox.stub(workerCreep, "move").returns(OK);
  } catch (err) {}
  workerCreep.pathIdx = pathIdx;
  workerCreep.pathPos = pathPos;
  workerCreep.targetPathPos = targetPathPos;
  return workerCreep;
}

describe("PathManager", () => {
  before(() => {
    init(sandbox);
  });

  it("add paths", () => {
    let pathManager = new PathManager("test");

    pathManager.addPath(testUtils.deserializePath("05054x83x54x7"));
    pathManager.addPath(testUtils.deserializePath("24097x46667x5666"));
    pathManager.addPath(testUtils.deserializePath("10152x93x5"));
    pathManager.addPath(testUtils.deserializePath("15208x622233555"));
    pathManager.addPath(testUtils.deserializePath("17223x8"));
    pathManager.addPath(testUtils.deserializePath("23205x6"));
    pathManager.addPath(testUtils.deserializePath("20231x52x4333"));

    should(global["Memory"].pathsInfo).be.eql({
      "0": {
        "path": testUtils.deserializePath("05054x83x54x7"),
        "reverse": testUtils.deserializePath("24198x87x58x7"),
        "connections": {
          "1": "2",
          "2": "4",
          "3": "6",
          "4": "4",
          "5": "12",
          "6": "16",
          "7": "16",
          "8": "16"
        },
        "directConnections": [1, 2, 3, 5, 8]
      },
      "1": {
        "path": testUtils.deserializePath("24097x46667"),
        "reverse": testUtils.deserializePath("171233222333"),
        "connections": {
          "0": "1",
          "2": "1",
          "3": "1",
          "4": "1",
          "5": "1",
          "6": "1",
          "7": "1",
          "8": "1"
        },
        "directConnections": [0]
      },
      "2": {
        "path": testUtils.deserializePath("13127666"),
        "reverse": testUtils.deserializePath("10152x4"),
        "connections": {
          "0": "3",
          "1": "3",
          "3": "8",
          "4": "10",
          "5": "3",
          "6": "3",
          "7": "3",
          "8": "3"
        },
        "directConnections": [0, 3, 4]
      },
      "3": {
        "path": testUtils.deserializePath("13122x63x5"),
        "reverse": testUtils.deserializePath("23077x66x5"),
        "connections": {
          "0": "5",
          "1": "5",
          "2": "7",
          "4": "7",
          "5": "5",
          "6": "5",
          "7": "5",
          "8": "5"
        },
        "directConnections": [0, 2]
      },
      "4": {
        "path": testUtils.deserializePath("15208x6"),
        "reverse": testUtils.deserializePath("10154x6"),
        "connections": {
          "0": "9",
          "1": "9",
          "2": "9",
          "3": "9",
          "5": "9",
          "6": "9",
          "7": "9",
          "8": "9"
        },
        "directConnections": [2]
      },
      "5": {
        "path": testUtils.deserializePath("15123555"),
        "reverse": testUtils.deserializePath("15151x4"),
        "connections": {
          "0": "11",
          "1": "11",
          "2": "11",
          "3": "11",
          "4": "11",
          "6": "11",
          "7": "11",
          "8": "11"
        },
        "directConnections": [0]
      },
      "6": {
        "path": testUtils.deserializePath("17223x8"),
        "reverse": testUtils.deserializePath("24227x8"),
        "connections": {
          "0": "18",
          "1": "18",
          "2": "18",
          "3": "18",
          "4": "18",
          "5": "18",
          "7": "14",
          "8": "18"
        },
        "directConnections": [7, 8]
      },
      "7": {
        "path": testUtils.deserializePath("23205x6"),
        "reverse": testUtils.deserializePath("23251x6"),
        "connections": {
          "0": "13",
          "1": "13",
          "2": "13",
          "3": "13",
          "4": "13",
          "5": "13",
          "6": "13",
          "8": "13"
        },
        "directConnections": [6]
      },
      "8": {
        "path": testUtils.deserializePath("20231x52x4333"),
        "reverse": testUtils.deserializePath("27157x46x45x4"),
        "connections": {
          "0": "15",
          "1": "15",
          "2": "15",
          "3": "15",
          "4": "15",
          "5": "15",
          "6": "17",
          "7": "17"
        },
        "directConnections": [0, 6]
      }
    });

    should(global["Memory"].pathConnections).be.eql({
      "1": {
        "idx": 0,
        "pos": 7,
        "targetPos": 12
      },
      "2": {
        "idx": 1,
        "pos": 12,
        "targetPos": 7
      },
      "3": {
        "idx": 0,
        "pos": 0,
        "targetPos": 8
      },
      "4": {
        "idx": 2,
        "pos": 8,
        "targetPos": 0
      },
      "5": {
        "idx": 0,
        "pos": 0,
        "targetPos": 8
      },
      "6": {
        "idx": 3,
        "pos": 8,
        "targetPos": 0
      },
      "7": {
        "idx": 2,
        "pos": 0,
        "targetPos": 0
      },
      "8": {
        "idx": 3,
        "pos": 0,
        "targetPos": 0
      },
      "9": {
        "idx": 2,
        "pos": 5,
        "targetPos": 3
      },
      "10": {
        "idx": 4,
        "pos": 3,
        "targetPos": 5
      },
      "11": {
        "idx": 0,
        "pos": 0,
        "targetPos": 10
      },
      "12": {
        "idx": 5,
        "pos": 10,
        "targetPos": 0
      },
      "13": {
        "idx": 6,
        "pos": 3,
        "targetPos": 6
      },
      "14": {
        "idx": 7,
        "pos": 6,
        "targetPos": 3
      },
      "15": {
        "idx": 0,
        "pos": 7,
        "targetPos": 17
      },
      "16": {
        "idx": 8,
        "pos": 17,
        "targetPos": 7
      },
      "17": {
        "idx": 6,
        "pos": 2,
        "targetPos": 3
      },
      "18": {
        "idx": 8,
        "pos": 3,
        "targetPos": 2
      }
    });
  });

  describe("Moving creeps without any other creeps", () => {
    let pathManager: PathManager;

    before(() => {
      pathManager = new PathManager("test");
    });

    beforeEach(() => {
      if (global["Memory"] && global["Memory"].creeps) {
        delete global["Memory"].creeps.testCreep;
      }
    });

    it("Moving creep to target in same path", function () {
      let creep: WorkerCreep = createWorkerCreep("testCreep", 0, 0, 0);
      let target = new CreepTarget("ct0").setPos(0, 6, 0);
  
      [{
        returnValue : OK,
        pathIdx : 0,
        pathPos : 1,
        targetPathPos : 6,
      }, {
        returnValue : OK,
        pathIdx : 0,
        pathPos : 2,
        targetPathPos : 6,
      }, {
        returnValue : OK,
        pathIdx : 0,
        pathPos : 3,
        targetPathPos : 6,
      }, {
        returnValue : OK,
        pathIdx : 0,
        pathPos : 4,
        targetPathPos : 6,
      }, {
        returnValue : OK,
        pathIdx : 0,
        pathPos : 5,
        targetPathPos : 6,
      }, {
        returnValue : "reachedTarget",
        pathIdx : 0,
        pathPos : 6,
        targetPathPos : 6,
      }].forEach((testData) => {
        (pathManager.pathNavigation.moveCreep(creep, target)).should.be.equal(testData.returnValue);
  
        (creep.pathIdx).should.be.equal(testData.pathIdx);
        (creep.pathPos).should.be.equal(testData.pathPos);
        (creep.targetPathPos).should.be.equal(testData.targetPathPos);
  
        creep.hasMoved = false;
        creep.processed = false;
      });
  
      pathManager.pathNavigation.creepHasDied(creep);
      (pathManager.pathsInfo.get(0).creeps).should.be.eql({});
    });
  
    it("Moving creep to target in next path", function () {
      let creep: WorkerCreep = createWorkerCreep("testCreep", 0, 8, 8);
      let target = new CreepTarget("ct1").setPos(1, 5, 0);
  
      [{
        returnValue : OK,
        pathIdx : 0,
        pathPos : 9,
        targetPathPos : 12,
      }, {
        returnValue : OK,
        pathIdx : 0,
        pathPos : 10,
        targetPathPos : 12,
      }, {
        returnValue : OK,
        pathIdx : 0,
        pathPos : 11,
        targetPathPos : 12,
      }, {
        returnValue : OK,
        pathIdx : 0,
        pathPos : 12,
        targetPathPos : 12,
      }, {
        returnValue : OK,
        pathIdx : 1,
        pathPos : 6,
        targetPathPos : 5,
      }, {
        returnValue : "reachedTarget",
        pathIdx : 1,
        pathPos : 5,
        targetPathPos : 5,
      }].forEach((testData, i) => {
        (pathManager.pathNavigation.moveCreep(creep, target)).should.be.equal(testData.returnValue);

        (creep.pathIdx).should.be.equal(testData.pathIdx);
        (creep.pathPos).should.be.equal(testData.pathPos);
        (creep.targetPathPos).should.be.equal(testData.targetPathPos);

        creep.hasMoved = false;
        creep.processed = false;
      });

      pathManager.pathNavigation.creepHasDied(creep);
      (pathManager.pathsInfo.get(0).creeps).should.be.eql({});
      (pathManager.pathsInfo.get(1).creeps).should.be.eql({});
    });

    it("Moving creep to target 2 paths out", function () {
      let creep: WorkerCreep = createWorkerCreep("testCreep", 0, 4, 4);
      let target = new CreepTarget("ct2").setPos(4, 2, 0);

      [{
        returnValue : OK,
        pathIdx : 0,
        pathPos : 5,
        targetPathPos : 8,
      }, {
        returnValue : OK,
        pathIdx : 0,
        pathPos : 6,
        targetPathPos : 8,
      }, {
        returnValue : OK,
        pathIdx : 0,
        pathPos : 7,
        targetPathPos : 8,
      }, {
        returnValue : OK,
        pathIdx : 0,
        pathPos : 8,
        targetPathPos : 8,
      }, {
        returnValue : OK,
        pathIdx : 2,
        pathPos : 1,
        targetPathPos : 3,
      }, {
        returnValue : OK,
        pathIdx : 2,
        pathPos : 2,
        targetPathPos : 3,
      }, {
        returnValue : OK,
        pathIdx : 2,
        pathPos : 3,
        targetPathPos : 3,
      }, {
        returnValue : OK,
        pathIdx : 4,
        pathPos : 4,
        targetPathPos : 2,
      }, {
        returnValue : OK,
        pathIdx : 4,
        pathPos : 3,
        targetPathPos : 2,
      }, {
        returnValue : "reachedTarget",
        pathIdx : 4,
        pathPos : 2,
        targetPathPos : 2,
      }].forEach((testData) => {
        (pathManager.pathNavigation.moveCreep(creep, target)).should.be.equal(testData.returnValue);
  
        (creep.pathIdx).should.be.equal(testData.pathIdx);
        (creep.pathPos).should.be.equal(testData.pathPos);
        (creep.targetPathPos).should.be.equal(testData.targetPathPos);
  
        creep.hasMoved = false;
        creep.processed = false;
      });

      pathManager.pathNavigation.creepHasDied(creep);
      (pathManager.pathsInfo.get(0).creeps).should.be.eql({});
      (pathManager.pathsInfo.get(2).creeps).should.be.eql({});
      (pathManager.pathsInfo.get(3).creeps).should.be.eql({});
    });
  });

  describe("Moving creep with other creeps on the same path", function () {
    let pathManager: PathManager;
    let creep: WorkerCreep, otherCreeps: Array<WorkerCreep>;

    before(function () {
      pathManager = new PathManager("test");
      creep = createWorkerCreep("testCreep", 0, 2, 7);
      // Game.creeps[creep.name] = creep;
      otherCreeps = [
        createWorkerCreep("testCreep01", 0, 3, 5),
        createWorkerCreep("testCreep02", 0, 4, 4),
        createWorkerCreep("testCreep03", 0, 5, 5),
        createWorkerCreep("testCreep04", 0, 6, 2),
        createWorkerCreep("testCreep05", 0, 8, 2),
      ];
    });

    [{
      title : "moving in the same direction",
      creep : {
        returnValue : "ok",
        pathIdx : 0,
        pathPos : 3,
        targetPathPos : 7,
      },
      post : true,
      otherCreep : {
        creep : 0,
        pathIdx : 0,
        pathPos : 4,
        targetPathPos : 5,
      },
      creeps : {
        3 : ["testCreep"],
        4 : ["testCreep01"],
      },
    }, {
      title : "swapped with stationary creep",
      creep : {
        returnValue : "ok",
        pathIdx : 0,
        pathPos : 4,
        targetPathPos : 7,
      },
      post : true,
      otherCreep : {
        creep : 1,
        pathIdx : 0,
        pathPos : 3,
        targetPathPos : 4,
      },
      creeps : {
        3 : ["testCreep02"],
        4 : ["testCreep"],
      },
    }, {
      title : "stationary but already processed",
      pre : true,
      otherCreep : {
        creep : 2,
        pathIdx : 0,
        pathPos : 4,
        targetPathPos : 5,
      },
      creep : {
        returnValue : "ok",
        pathIdx : 0,
        pathPos : 5,
        targetPathPos : 7,
      },
      creeps : {
        4 : ["testCreep03"],
        5 : ["testCreep"],
      },
    }, {
      title : "moving in the opposite direction",
      creep : {
        returnValue : "ok",
        pathIdx : 0,
        pathPos : 6,
        targetPathPos : 7,
      },
      post : true,
      otherCreep : {
        creep : 3,
        pathIdx : 0,
        pathPos : 5,
        targetPathPos : 2,
      },
      creeps : {
        5 : ["testCreep04"],
        6 : ["testCreep"],
      },
    }, {
      title : "moving in the opposite direction but already moved",
      pre : true,
      otherCreep : {
        creep : 4,
        pathIdx : 0,
        pathPos : 7,
        targetPathPos : 2,
      },
      creep : {
        returnValue : -20,
        pathIdx : 0,
        pathPos : 6,
        targetPathPos : 7,
      },
      creeps : {
        6 : ["testCreep"],
        7 : ["testCreep05"],
      },
    }].forEach((testData) => {
      it(testData.title, () => {
        let otherCreep = otherCreeps[testData.otherCreep.creep];
        let target = new CreepTarget()
          .setPos(testData.creep.pathIdx, testData.creep.targetPathPos, 0);
        let otherTarget = new CreepTarget()
          .setPos(testData.otherCreep.pathIdx, testData.otherCreep.targetPathPos, 0);

        // global["Game"].creeps[otherCreep.name] = otherCreep;
        pathManager.pathsInfo.get(testData.otherCreep.pathIdx).creeps[otherCreep.pathPos] = [otherCreep.name];
        if (testData.pre) {
          pathManager.pathNavigation.moveCreep(otherCreep, otherTarget);
        }

        (pathManager.pathNavigation.moveCreep(creep, target)).should.be.equal(testData.creep.returnValue);

        if (testData.post) {
          pathManager.pathNavigation.moveCreep(otherCreep, otherTarget);
        }

        (creep.pathIdx).should.be.equal(testData.creep.pathIdx);
        (creep.pathPos).should.be.equal(testData.creep.pathPos);
        (creep.targetPathPos).should.be.equal(testData.creep.targetPathPos);

        (otherCreep.pathIdx).should.be.equal(testData.otherCreep.pathIdx);
        (otherCreep.pathPos).should.be.equal(testData.otherCreep.pathPos);
        (otherCreep.targetPathPos).should.be.equal(testData.otherCreep.targetPathPos);

        pathManager.pathNavigation.creepHasDied(otherCreep);
      });
    });

    it("creeps is empty for pathInfo of path 0", function () {
      pathManager.pathNavigation.creepHasDied(creep);
      (pathManager.pathsInfo.get(0).creeps).should.be.eql({});
    });

    afterEach(function () {
      creep.hasMoved = false;
      creep.processed = false;
    });
  });

  describe("Moving creep with other creeps on the different paths", function () {
    let pathManager: PathManager;

    before(function () {
      pathManager = new PathManager("test");
    });

    beforeEach(() => {
      CreepWrapper.clearObjects();
    });

    [{
      title : "one moving past, one blocking another",
      creeps : [{
        creep : {
          name : "creep1",
          pathIdx : 0,
          pathPos : 18,
          targetPathPos : 10,
        },
        target : {},
        result : {
          pathIdx : 0,
          pathPos : 18,
          returnValue : -20,
        },
      }, {
        creep : {
          name : "creep2",
          pathIdx : 8,
          pathPos : 7,
          targetPathPos : 2,
        },
        target : {},
        result : {
          pathIdx : 8,
          pathPos : 6,
          returnValue : "ok",
        },
      }, {
        creep : {
          name : "creep3",
          pathIdx : 8,
          pathPos : 6,
          targetPathPos : 8,
        },
        target : {},
        result : {
          pathIdx : 8,
          pathPos : 7,
          returnValue : "ok",
        },
      }],
      creepsInfo : {
        0 : {
          18 : ["creep1"],
        },
        8 : {
          6 : ["creep2"],
          7 : ["creep3"],
        },
      },
    }, {
      title : "swapping with a stationary creep in the other path",
      creeps : [{
        creep : {
          name : "creep1",
          pathIdx : 0,
          pathPos : 18,
          targetPathPos : 10,
        },
        target : {},
        result : {
          pathIdx : 0,
          pathPos : 17,
          returnValue : "ok",
        },
      }, {
        creep : {
          name : "creep2",
          pathIdx : 8,
          pathPos : 7,
          targetPathPos : 7,
        },
        target : {},
        result : {
          pathIdx : 0,
          pathPos : 18,
          returnValue : "ok",
        },
      }],
      creepsInfo : {
        0 : {
          17 : ["creep1"],
          18 : ["creep2"],
        },
      },
    }, {
      title : "swapping with a moving creeps swapping paths",
      creeps : [{
        creep : {
          name : "creep1",
          pathIdx : 0,
          pathPos : 17,
          targetPathPos : 17,
        },
        target : {
          pathIdx : 8,
          pathPos : 6,
        },
        result : {
          pathIdx : 8,
          pathPos : 6,
          returnValue : "reachedTarget",
        },
      }, {
        creep : {
          name : "creep2",
          pathIdx : 8,
          pathPos : 7,
          targetPathPos : 7,
        },
        target : {
          pathIdx : 0,
          pathPos : 17,
        },
        result : {
          pathIdx : 0,
          pathPos : 17,
          returnValue : "reachedTarget",
        },
      }],
      creepsInfo : {
        0 : {
          17 : ["creep2"],
        },
        8 : {
          6 : ["creep1"],
        }
      },
    }].forEach((testData: any) => {
      it (testData.title, () => {
        testData.creeps.forEach((creepData) => {
          creepData.creep = createWorkerCreep(
            creepData.creep.name,
            creepData.creep.pathIdx,
            creepData.creep.pathPos,
            creepData.creep.targetPathPos
          );
          pathManager.pathsInfo.get(creepData.creep.pathIdx)
            .creeps[creepData.creep.pathPos] = [creepData.creep.name];
        });

        testData.creeps.forEach((creepData) => {
          (pathManager.pathNavigation.moveCreep(creepData.creep, creepData.target))
            .should.be.equal(creepData.result.returnValue);
        });

        testData.creeps.forEach((creepData) => {
          (creepData.creep.pathIdx).should.be.equal(creepData.result.pathIdx);
          (creepData.creep.pathPos).should.be.equal(creepData.result.pathPos);
        });

        for (let pathIdx in testData.creepsInfo) {
          (pathManager.pathsInfo.get(pathIdx).creeps).should.be.eql(testData.creepsInfo[pathIdx]);
        }

        testData.creeps.forEach((creepData) => {
          pathManager.pathNavigation.creepHasDied(creepData.creep);
        });

        for (let pathIdx in testData.creepsInfo) {
          (pathManager.pathsInfo.get(pathIdx).creeps).should.be.eql({});
        }
      });
    });
  });

  // moving awat and towards path is broken right now.
  describe.skip("Moving creep away and towards the path", function () {
    let pathManager: PathManager;

    before(function () {
      pathManager = new PathManager("test");
    });

    beforeEach(function () {
      // sandbox.reset();

      // stub();

      CreepWrapper.clearObjects();
    });

    [{
      title : "One moving away and another along a path",
      creeps : [{
        creep : {
          name : "creep1",
          pathIdx : 0,
          pathPos : 1,
          direction : 0,
          targetPathPos : 1,
        },
        target : {
          pathIdx : 0,
          pathPos : 1,
          direction : 2,
          isEqualTo : false,
        },
        result : {
          pathIdx : 0,
          pathPos : 1,
          targetPathPos : 1,
          movedAway : 2,
          returnValue : "reachedTarget",
        },
      }, {
        creep : {
          name : "creep2",
          pathIdx : 0,
          pathPos : 2,
          direction : 0,
          targetPathPos : 0,
        },
        target : {
          pathIdx : 0,
          pathPos : 0,
          isEqualTo : true,
        },
        result : {
          pathIdx : 0,
          pathPos : 1,
          targetPathPos : 0,
          movedAway : 0,
          returnValue : "ok",
        },
      }],
      creepsInfo : {
        0 : {
          1 : ["creep1", "creep2"],
        },
      },
    }, {
      title : "One moving along and another away from path",
      creeps : [{
        creep : {
          name : "creep1",
          pathIdx : 0,
          pathPos : 2,
          direction : 0,
          targetPathPos : 0,
        },
        target : {
          isEqualTo : true,
          pathIdx : 0,
          pathPos : 0,
        },
        result : {
          pathIdx : 0,
          pathPos : 1,
          targetPathPos : 0,
          movedAway : 0,
          returnValue : "ok",
        },
      }, {
        creep : {
          name : "creep2",
          pathIdx : 0,
          pathPos : 1,
          direction : 0,
          targetPathPos : 1,
        },
        target : {
          pathIdx : 0,
          pathPos : 1,
          direction : 2,
          isEqualTo : false,
        },
        result : {
          pathIdx : 0,
          pathPos : 1,
          targetPathPos : 1,
          movedAway : 2,
          returnValue : "reachedTarget",
        },
      }],
      creepsInfo : {
        0 : {
          1 : ["creep1", "creep2"],
        },
      },
    }, {
      title : "One moving away, another stationary in the other direction and yet another along the path",
      creeps : [{
        creep : {
          name : "creep1",
          pathIdx : 0,
          pathPos : 1,
          movedAway : 0,
          targetPathPos : 1,
        },
        target : {
          pathIdx : 0,
          pathPos : 1,
          direction : 2,
          isEqualTo : false,
        },
        result : {
          pathIdx : 0,
          pathPos : 1,
          movedAway : 2,
          targetPathPos : 1,
          returnValue : "reachedTarget",
        },
      }, {
        creep : {
          name : "creep2",
          pathIdx : 0,
          pathPos : 1,
          movedAway : 6,
          targetPathPos : 1,
        },
        target : {
          pathIdx : 0,
          pathPos : 1,
          direction : 6,
          isEqualTo : true,
        },
        result : {
          pathIdx : 0,
          pathPos : 1,
          movedAway : 6,
          targetPathPos : 1,
          returnValue : "reachedTarget",
        },
      }, {
        creep : {
          name : "creep3",
          pathIdx : 0,
          pathPos : 0,
          movedAway : 0,
          targetPathPos : 3,
        },
        target : {
          isEqualTo : true,
        },
        result : {
          pathIdx : 0,
          pathPos : 1,
          movedAway : 0,
          targetPathPos : 3,
          returnValue : "ok",
        },
      }],
      creepsInfo : {
        0 : {
          1 : ["creep1", "creep2", "creep3"],
        },
      },
    }, {
      title : "One moving along, another away and yet another stationary in the other direction in same path",
      creeps : [{
        creep : {
          name : "creep1",
          pathIdx : 0,
          pathPos : 0,
          movedAway : 0,
          targetPathPos : 3,
        },
        target : {
          isEqualTo : true,
        },
        result : {
          pathIdx : 0,
          pathPos : 1,
          movedAway : 0,
          targetPathPos : 3,
          returnValue : "ok",
        },
      }, {
        creep : {
          name : "creep2",
          pathIdx : 0,
          pathPos : 1,
          movedAway : 0,
          targetPathPos : 1,
        },
        target : {
          pathIdx : 0,
          pathPos : 1,
          direction : 2,
          isEqualTo : false,
        },
        result : {
          pathIdx : 0,
          pathPos : 1,
          movedAway : 2,
          targetPathPos : 1,
          returnValue : "reachedTarget",
        },
      }, {
        creep : {
          name : "creep3",
          pathIdx : 0,
          pathPos : 1,
          movedAway : 6,
          targetPathPos : 1,
        },
        target : {
          pathIdx : 0,
          pathPos : 1,
          direction : 6,
          isEqualTo : true,
        },
        result : {
          pathIdx : 0,
          pathPos : 1,
          movedAway : 6,
          targetPathPos : 1,
          returnValue : "reachedTarget",
        },
      }],
      creepsInfo : {
        0 : {
          1 : ["creep1", "creep2", "creep3"],
        },
      },
    }, {
      title : "One moving away, another towards and yet another along the path",
      creeps : [{
        creep : {
          name : "creep1",
          pathIdx : 0,
          pathPos : 1,
          movedAway : 0,
          targetPathPos : 1,
        },
        target : {
          pathIdx : 0,
          pathPos : 1,
          direction : 2,
          isEqualTo : false,
        },
        result : {
          pathIdx : 0,
          pathPos : 1,
          movedAway : 2,
          targetPathPos : 1,
          //creep is not moved in it's execution, rather during the creep that is away from path
          returnValue : -20,
        },
      }, {
        creep : {
          name : "creep2",
          pathIdx : 0,
          pathPos : 1,
          movedAway : 2,
          targetPathPos : 1,
        },
        target : {
          pathIdx : 0,
          pathPos : 5,
          isEqualTo : false,
        },
        result : {
          pathIdx : 0,
          pathPos : 1,
          movedAway : 0,
          targetPathPos : 5,
          returnValue : "ok",
        },
      }, {
        creep : {
          name : "creep3",
          pathIdx : 0,
          pathPos : 0,
          movedAway : 0,
          targetPathPos : 3,
        },
        target : {
          isEqualTo : true,
        },
        result : {
          pathIdx : 0,
          pathPos : 0,
          movedAway : 0,
          targetPathPos : 3,
          returnValue : -20,
        },
      }],
      creepsInfo : {
        0 : {
          0 : ["creep3"],
          1 : ["creep1", "creep2"],
        },
      },
    }, {
      title : "One moving towards, another away and yet another along the path",
      creeps : [{
        creep : {
          name : "creep1",
          pathIdx : 0,
          pathPos : 1,
          movedAway : 2,
          targetPathPos : 1,
        },
        target : {
          pathIdx : 0,
          pathPos : 5,
          isEqualTo : false,
        },
        result : {
          pathIdx : 0,
          pathPos : 1,
          movedAway : 0,
          targetPathPos : 5,
          returnValue : "ok",
        },
      }, {
        creep : {
          name : "creep2",
          pathIdx : 0,
          pathPos : 1,
          movedAway : 0,
          targetPathPos : 1,
        },
        target : {
          pathIdx : 0,
          pathPos : 1,
          direction : 2,
          isEqualTo : false,
        },
        result : {
          pathIdx : 0,
          pathPos : 1,
          movedAway : 2,
          targetPathPos : 1,
          returnValue : "reachedTarget",
        },
      }, {
        creep : {
          name : "creep3",
          pathIdx : 0,
          pathPos : 0,
          movedAway : 0,
          targetPathPos : 3,
        },
        target : {
          isEqualTo : true,
        },
        result : {
          pathIdx : 0,
          pathPos : 0,
          movedAway : 0,
          targetPathPos : 3,
          returnValue : -20,
        },
      }],
      creepsInfo : {
        0 : {
          0 : ["creep3"],
          1 : ["creep1", "creep2"],
        },
      },
    }].forEach((testData: any) => {
      it (testData.title, () => {
        testData.creeps.forEach((creepData, i) => {
          let creep = createWorkerCreep(
            creepData.creep.name,
            creepData.creep.pathIdx,
            creepData.creep.pathPos,
            creepData.creep.targetPathPos
          );
          creep.movedAway = creepData.creep.movedAway;
          creepData.creep = creep;
          creep.pos = {
            isEqualTo : sandbox.stub().returns(creepData.target.isEqualTo),
          };

          let target = new CreepTarget()
            .setPos(creepData.target.pathIdx, creepData.target.pathPos, creepData.target.direction || 0);
          creepData.target = target;

          let pathInfo = pathManager.pathsInfo.get(creepData.creep.pathIdx);
          pathInfo.creeps[creepData.creep.pathPos] =
            pathInfo.creeps[creepData.creep.pathPos] || [];
          pathInfo.creeps[creepData.creep.pathPos].push(creepData.creep.name);
        });

        testData.creeps.forEach((creepData) => {
          //console.log(creepData.creep.name, creepData.result.returnValue);
          (pathManager.pathNavigation.moveCreep(creepData.creep, creepData.target)).should.be.equal(creepData.result.returnValue);
        });

        testData.creeps.forEach((creepData) => {
          //console.log(creepData.creep.name);
          (creepData.creep.pathIdx).should.be.equal(creepData.result.pathIdx);
          (creepData.creep.pathPos).should.be.equal(creepData.result.pathPos);
          (creepData.creep.movedAway).should.be.equal(creepData.result.movedAway);
          (creepData.creep.targetPathPos).should.be.equal(creepData.result.targetPathPos);
        });

        for (let pathIdx in testData.creepsInfo) {
          (pathManager.pathsInfo.get(pathIdx).creeps).should.be.containDeep(testData.creepsInfo[pathIdx]);
        }

        testData.creeps.forEach((creepData) => {
          pathManager.pathNavigation.creepHasDied(creepData.creep);
        });

        for (let pathIdx in testData.creepsInfo) {
          (pathManager.pathsInfo.get(pathIdx).creeps).should.be.eql({});
        }
      });
    });
  });
});