let sinon = require("sinon");
let should = require("should");
let sandbox = sinon.sandbox.create();
let mockery = require("mockery");
let globals = require("../mocks/globals");
let testUtils = require("../test-utils");

describe("BuildTask", function () {
  let BuildTask, math, room = {
    pathManager : {},
  };
  before(function () {
    globals.init(sandbox);
    mockery.enable({ useCleanCache: true });
    testUtils.registerAllowables(mockery, "constants", "utils", "math", "heap", "base.class", "task.base", "event.bus");

    mockery.registerAllowable("../../default/task.build");
    BuildTask = require("../../default/task.build");
    math = require("math");

    room.find = sandbox.stub();
    room.pathManager.moveCreep = sandbox.stub();
  });

  it("init", function () {
    room.find.returns([{
      id : "t0",
    }, {
      id : "t1",
    }, {
      id : "t2",
    }]);
    let buildTask = new BuildTask("test");
    buildTask.init(room);

    (buildTask.targetsMap).should.be.eql({
      t0 : 0,
      t1 : 0,
      t2 : 0,
    });
    (buildTask.hasTarget).should.be.equal(true);
  });

  describe("Claim target and do task", function () {
    let creep0 = {
      pos : { x : 0, y : 0 },
      carry : {
        energy : 50,
      },
      task : {
        tier : 0,
        targets : {},
      },
    }, creep1 = {
      pos : { x : 1, y : 1 },
      carry : {
        energy : 50,
      },
      task : {
        tier : 0,
        targets : {},
      },
    }, creep2 = {
      pos : { x : 0, y : 1 },
      carry : {
        energy : 50,
      },
      task : {
        tier : 0,
        targets : {},
      },
    };
    let target0 = {
      id : "t0",
      progressTotal : 100,
      structureType : "road",
      pos : { x : 5, y : 5 },
    }, target1 = {
      id : "t1",
      progressTotal : 200,
      structureType : "extension",
      pos : { x : 7, y : 5 },
    }, target2 = {
      id : "t2",
      progressTotal : 200,
      structureType : "container",
      pos : { x : 5, y : 7 },
    };
    let buildTask;

    before(function () {
      buildTask = new BuildTask("test");
      buildTask.room = room;
      creep0.move = sandbox.stub();
      creep0.build = sandbox.stub();
      creep1.move = sandbox.stub();
      creep1.build = sandbox.stub();
      creep2.move = sandbox.stub();
      creep2.build = sandbox.stub();
    });

    beforeEach(function () {
      sandbox.reset();
      global.Game.getObjectById.withArgs("t0").returns(target0);
      global.Game.getObjectById.withArgs("t1").returns(target1);
      global.Game.getObjectById.withArgs("t2").returns(target2);
      room.pathManager.moveCreep.returns("creepReachedTarget");
      creep0.build.returns(OK);
      creep1.build.returns(OK);
      creep2.build.returns(OK);
    });

    it("Get assigned targets", function () {
      buildTask.execute(creep0);
      buildTask.execute(creep1);
      buildTask.execute(creep2);
      (buildTask.targetsMap).should.be.eql({
        t0: 100, t1: 0, t2: 50,
      });
      (creep0.task).should.be.eql({
        tier : 0,
        targets : { '0': 't0' },
        targetType : "road",
        targetPos : { x : 5, y : 5 },
      });
      (creep1.task).should.be.eql({
        tier : 0,
        targets : { '0': 't0' },
        targetType : "road",
        targetPos : { x : 5, y : 5 },
      });
      (creep2.task).should.be.eql({
        tier : 0,
        targets : { '0': 't2' },
        targetType : "container",
        targetPos : { x : 5, y : 7 },
      });
    });

    it("Once creep has died", function () {
      buildTask.creepHasDied(creep0);

      buildTask.execute(creep1);
      buildTask.execute(creep2);
      (buildTask.targetsMap).should.be.eql({
        t0: 50, t1: 0, t2: 50,
      });
    });

    it("Ending tasks", function () {
      buildTask.taskEnded(creep1);
      buildTask.taskEnded(creep2);
      (buildTask.targetsMap).should.be.eql({
        t0: 0, t1: 0, t2: 0,
      });
    })

    it("Starting tasks", function () {
      creep2.task.source = "s0";
      global.Game.getObjectById.withArgs("s0").returns({ pos : { x : 1, y : -1 }});
      buildTask.taskStarted(creep1);
      buildTask.taskStarted(creep2);
      (buildTask.targetsMap).should.be.eql({
        t0: 50, t1: 0, t2: 50,
      });
      sinon.assert.notCalled(creep1.move);
      sinon.assert.calledOnce(creep2.move);
      sinon.assert.calledWith(creep2.move, 6);
    });

    after(function () {
      buildTask.creepHasDied(creep1);
      buildTask.creepHasDied(creep2);
    });
  });

  describe("execute on invalid target", function() {
    it("single creep test", function () {
      let creep0 = {
        pos : { x : 0, y : 0 },
        carry : {
          energy : 50,
        },
        task : {
          tier : 0,
          targets : { '0': 't0' },
          targetType : "road",
          targetPos : { x : 5, y : 5 },
        },
        build : sandbox.stub().returns(OK),
      };
      let structure = {
        structureType : "road",
      };
      global.Game.getObjectById.withArgs("t0").returns(null);
      global.Game.getObjectById.withArgs("t1").returns(null);
      global.Game.getObjectById.withArgs("t2").returns(null);
      let buildTask = new BuildTask("test");
      buildTask.room = room;
      room.lookForAt = sandbox.stub().returns([structure]);
      room.fireEvent = sandbox.stub();

      buildTask.execute(creep0);

      sinon.assert.calledOnce(room.lookForAt);
      sinon.assert.calledWith(room.lookForAt, "lookStructures", 5, 5);
      sinon.assert.calledOnce(room.fireEvent);
      sinon.assert.calledWith(room.fireEvent, "strucureBuilt", structure);
    });
  });

  after(function () {
    mockery.deregisterAll();
    mockery.disable();
    sandbox.restore();
    delete global.Memory;
  });
});
