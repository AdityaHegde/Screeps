let sinon = require("sinon");
let should = require("should");
let sandbox = sinon.sandbox.create();
let mockery = require("mockery");
let globals = require("../mocks/globals");
let testUtils = require("../test-utils");

describe("BuildPlanner", function() {
    let BuildTask, math, room = {
        pathManager : {},
    };
    before(function() {
        mockery.enable({ useCleanCache: true });
        testUtils.registerAllowables(mockery, "constants", "utils", "math", "base.class", "task.base", "event.bus");
        globals.init(sandbox);

        mockery.registerAllowable("../../default/task.build");
        BuildTask = require("../../default/task.build");
        math = require("math");

        room.find = sandbox.stub();
        room.pathManager.moveCreep = sandbox.stub();
    });

    it("init", function() {
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

    it("Caim target and do task", function() {
        let creep0 = {
            pos : { x : 0, y : 0 },
            carry : {
                energy : 50,
            },
            task : {
                tier : 0,
                targets : {},
            },
            build : sandbox.stub().returns(OK),
        }, creep1 = {
            pos : { x : 0, y : 0 },
            carry : {
                energy : 50,
            },
            task : {
                tier : 0,
                targets : {},
            },
            build : sandbox.stub().returns(OK),
        }, creep2 = {
            pos : { x : 0, y : 0 },
            carry : {
                energy : 50,
            },
            task : {
                tier : 0,
                targets : {},
            },
            build : sandbox.stub().returns(OK),
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
        global.Game.getObjectById.withArgs("t0").returns(target0);
        global.Game.getObjectById.withArgs("t1").returns(target1);
        global.Game.getObjectById.withArgs("t2").returns(target2);
        let buildTask = new BuildTask("test");
        buildTask.room = room;
        room.pathManager.moveCreep.returns("creepReachedTarget");

        buildTask.execute(creep0);
        buildTask.execute(creep1);
        buildTask.execute(creep2);
        (buildTask.targetsMap).should.be.eql({
            t0: 100, t1: 50, t2: 0,
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
            targets : { '0': 't1' },
            targetType : "extension",
            targetPos : { x : 7, y : 5 },
        });

        buildTask.creepHasDied(creep0);

        buildTask.execute(creep1);
        buildTask.execute(creep2);
        (buildTask.targetsMap).should.be.eql({
            t0: 50, t1: 50, t2: 0,
        });
    });

    after(function() {
        mockery.deregisterAll();
        mockery.disable();
        sandbox.restore();
        delete global.Memory;
    });
});
