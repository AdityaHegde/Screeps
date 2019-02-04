let sinon = require("sinon");
let should = require("should");
let sandbox = sinon.sandbox.create();
let mockery = require("mockery");
let globals = require("../mocks/globals");
let testUtils = require("../test-utils");

describe("EnemyArmy", function () {
  let EnemyArmy, room = {};
  before(function () {
    globals.init(sandbox);
    mockery.enable({ useCleanCache: true });
    testUtils.registerAllowables(mockery, "math", "heap", "utils", "base.class");

    mockery.registerAllowable("../../default/army.enemy");
    EnemyArmy = require("../../default/army.enemy");

    room.find = sandbox.stub();
    Game.rooms.testRoom = room;
  });

  beforeEach(function() {
    sandbox.reset();
  });

  it("first call to init", function() {
    let army = new EnemyArmy("test");
    army.roomName = "testRoom";
    room.find.returns([{
      name : "c0",
      hits : 100,
    }, {
      name : "c1",
      hits : 800,
    }, {
      name : "c2",
      hits : 500,
    }, {
      name : "c3",
      hits : 300,
    }, {
      name : "c4",
      hits : 400,
    }]);

    army.tick();

    (army.enemyCreeps).should.be.eql([{
      name : "c1",
      hits : 800,
    }, {
      name : "c4",
      hits : 400,
    }, {
      name : "c2",
      hits : 500,
    }, {
      name : "c0",
      hits : 100,
    }, {
      name : "c3",
      hits : 300,
    }]);
    (army.memory.enemyArmy).should.be.eql(["c1", "c4", "c2", "c0", "c3"]);
    (army.enemyCreepInfo).should.be.eql({
      c0 : {
        weight : 100,
        lastSeen : 0,
      },
      c1 : {
        weight : 800,
        lastSeen : 0,
      },
      c2 : {
        weight : 500,
        lastSeen : 0,
      },
      c3 : {
        weight : 300,
        lastSeen : 0,
      },
      c4 : {
        weight : 400,
        lastSeen : 0,
      },
    });
  });

  it("one creep missing, another updated hits", function() {
    let army = new EnemyArmy("test");
    army.roomName = "testRoom";
    room.find.returns([{
      name : "c0",
      hits : 100,
    }, {
      name : "c1",
      hits : 50,
    }, {
      name : "c2",
      hits : 500,
    }, {
      name : "c4",
      hits : 400,
    }]);

    army.tick();

    (army.enemyCreeps).should.be.eql([{
      name : "c2",
      hits : 500,
    }, {
      name : "c4",
      hits : 400,
    }, {
      name : "c1",
      hits : 50,
    }, {
      name : "c0",
      hits : 100,
    }]);
    (army.memory.enemyArmy).should.be.eql(["c2", "c4", "c1", "c0", "c3"]);
    (army.enemyCreepInfo).should.be.eql({
      c0 : {
        weight : 100,
        lastSeen : 0,
      },
      c1 : {
        weight : 50,
        lastSeen : 0,
      },
      c2 : {
        weight : 500,
        lastSeen : 0,
      },
      c3 : {
        weight : 300,
        lastSeen : 1,
      },
      c4 : {
        weight : 400,
        lastSeen : 0,
      },
    });

    army.tick();
    (army.memory.enemyArmy).should.be.eql(["c2", "c4", "c1", "c0", "c3"]);
    (army.enemyCreepInfo.c3).should.be.eql({
      weight : 300,
      lastSeen : 2,
    });

    army.tick();
    (army.memory.enemyArmy).should.be.eql(["c2", "c4", "c1", "c0", "c3"]);
    (army.enemyCreepInfo.c3).should.be.eql({
      weight : 300,
      lastSeen : 3,
    });

    army.tick();
    (army.memory.enemyArmy).should.be.eql(["c2", "c4", "c1", "c0", "c3"]);
    (army.enemyCreepInfo.c3).should.be.eql({
      weight : 300,
      lastSeen : 4,
    });

    army.tick();
    (army.memory.enemyArmy).should.be.eql(["c2", "c4", "c1", "c0", "c3"]);
    (army.enemyCreepInfo.c3).should.be.eql({
      weight : 300,
      lastSeen : 5,
    });

    army.tick();
    (army.memory.enemyArmy).should.be.eql(["c2", "c4", "c1", "c0"]);
    should(army.enemyCreepInfo.c3).be.equal(undefined);
  });

  after(function () {
    mockery.deregisterAll();
    mockery.disable();
    sandbox.restore();
    delete global.Memory;
  });
});
