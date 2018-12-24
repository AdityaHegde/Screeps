let sinon = require("sinon");
let should = require("should");
let sandbox = sinon.sandbox.create();
let mockery = require("mockery");
let globals = require("../mocks/globals");
let testUtils = require("../test-utils");

describe("SourceManager", function () {
  let PathManager, room, utils, math;
  let source0, source1;

  before(function () {
    globals.init(sandbox);
    mockery.enable({ useCleanCache: true });
    testUtils.registerAllowables(mockery, "utils", "heap", "math");
    mockery.registerAllowable("../../default/source.manager");
    PathManager = require("../../default/source.manager");
    utils = require("utils");
    math = require("math");
    room = new global.Room();
    room.name = "testRoom";
    room.find = sandbox.stub();
    room.pathManager = {
      addPath : sandbox.spy(function () {
        return this.size++;
      }),
      pathsInfo : [
        testUtils.getPathInfo("15331556666677777", math),
        testUtils.getPathInfo("1533133332223333224433333", math),
        testUtils.getPathInfo("153311111222233333188865555", math),
      ],
      size : 3,
    };

    source0 = new global.Source();
    source0.id = "s0";
    source0.pos = { x : 5, y : 40 };
    source0.room = room;
    source1 = new global.Source();
    source1.id = "s1";
    source1.pos = { x : 35, y : 30 };
    source1.room = room;

    globals.updatePrototypes(sandbox, utils);
  });

  beforeEach(function () {
    global.Game.getObjectById.withArgs("s0").returns(source0);
    global.Game.getObjectById.withArgs("s1").returns(source1);
  });

  it("addSources", function () {
    global.Game.map.getTerrainAt.returns("wall");
    global.Game.map.getTerrainAt.withArgs(6, 39, "testRoom").returns("plain");
    global.Game.map.getTerrainAt.withArgs(6, 40, "testRoom").returns("plain");
    global.Game.map.getTerrainAt.withArgs(6, 41, "testRoom").returns("plain");
    global.Game.map.getTerrainAt.withArgs(5, 41, "testRoom").returns("plain");
    global.Game.map.getTerrainAt.withArgs(4, 41, "testRoom").returns("plain");
    global.Game.map.getTerrainAt.withArgs(4, 40, "testRoom").returns("plain");
    global.Game.map.getTerrainAt.withArgs(34, 30, "testRoom").returns("plain");

    room.find.returns([source0, source1]);
    room.addSources();
    source0.pathIdx = 0;
    source0.pathPos = 12;
    source1.pathIdx = 1;
    source1.pathPos = 20;
    room.initSources();

    (source0.spaces).should.be.eql([
      { x: 6, y: 39, direction: 2, pathIdx: 3, pathPos: 0, count : 0 },
      { x: 6, y: 40, direction: 3, pathIdx: 3, pathPos: 2, count : 0 },
      { x: 6, y: 41, direction: 4, pathIdx: 3, pathPos: 4, count : 0 },
      { x: 5, y: 41, direction: 5, pathIdx: 3, pathPos: 6, count : 0 },
      { x: 4, y: 41, direction: 6, pathIdx: 3, pathPos: 8, count : 0 },
      { x: 4, y: 40, direction: 7, pathIdx: 3, pathPos: 10, count : 0 },
    ]);
    (source1.spaces).should.be.eql([
      { x: 34, y: 30, direction: 7, pathIdx: 4, pathPos: 0, count : 0 },
    ]);

    sinon.assert.calledTwice(room.pathManager.addPath);
    (room.pathManager.addPath.args).should.be.eql([
      [testUtils.deserializePath("073815555777711"), { 0 : { fromPos : 10, toPos : 2 } }],
      [[{
        x : 33,
        y : 30,
        dx : 0,
        dy : -1,
        direction : 1,
      }], { 1 : { fromPos : 18, toPos : 0 } }],
    ]);
  });

  it("findAndClaimSource", function () {
    let creeps = [{ task : {} }, { task : {} }, { task : {} }, { task : {} }, { task : {} }, { task : {} }, { task : {} }, { task : {} }, { task : {} }, { task : {} }];

    creeps.forEach((creep, i) => {
      creep.name = "c" + i;
      room.findAndClaimSource(creep);
    });

    (creeps).should.be.eql([
      { task : { source : "s0", space : 0 }, name : "c0" },
      { task : { source : "s1", space : 0 }, name : "c1" },
      { task : { source : "s0", space : 1 }, name : "c2" },
      { task : { source : "s0", space : 2 }, name : "c3" },
      { task : { source : "s0", space : 3 }, name : "c4" },
      { task : { source : "s0", space : 4 }, name : "c5" },
      { task : { source : "s0", space : 5 }, name : "c6" },
      { task : { source : "s1", space : 0 }, name : "c7" },
      { task : { source : "s0", space : 0 }, name : "c8" },
      { task : { source : "s0", space : 1 }, name : "c9" },
    ]);
    (source0.spaces).should.be.eql([
      { x: 6, y: 39, direction: 2, pathIdx: 3, pathPos: 0, count : 2 },
      { x: 6, y: 40, direction: 3, pathIdx: 3, pathPos: 2, count : 2 },
      { x: 6, y: 41, direction: 4, pathIdx: 3, pathPos: 4, count : 1 },
      { x: 5, y: 41, direction: 5, pathIdx: 3, pathPos: 6, count : 1 },
      { x: 4, y: 41, direction: 6, pathIdx: 3, pathPos: 8, count : 1 },
      { x: 4, y: 40, direction: 7, pathIdx: 3, pathPos: 10, count : 1 },
    ]);
    (source1.spaces).should.be.eql([
      { x: 34, y: 30, direction: 7, pathIdx: 4, pathPos: 0, count : 2 },
    ]);

    source0.release(creeps[0]);
    source1.release(creeps[1]);
    source0.release(creeps[4]);
    source0.release(creeps[5]);
    source0.release(creeps[7]);
    (source0.spaces).should.be.eql([
      { x: 6, y: 39, direction: 2, pathIdx: 3, pathPos: 0, count : 0 },
      { x: 6, y: 40, direction: 3, pathIdx: 3, pathPos: 2, count : 2 },
      { x: 6, y: 41, direction: 4, pathIdx: 3, pathPos: 4, count : 1 },
      { x: 5, y: 41, direction: 5, pathIdx: 3, pathPos: 6, count : 0 },
      { x: 4, y: 41, direction: 6, pathIdx: 3, pathPos: 8, count : 0 },
      { x: 4, y: 40, direction: 7, pathIdx: 3, pathPos: 10, count : 1 },
    ]);
    (source1.spaces).should.be.eql([
      { x: 34, y: 30, direction: 7, pathIdx: 4, pathPos: 0, count : 1 },
    ]);
  });

  after(function () {
    mockery.deregisterAll();
    mockery.disable();
    sandbox.restore();
    delete global.Memory;
  });
});
