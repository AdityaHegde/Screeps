let sinon = require("sinon");
let should = require("should");
let sandbox = sinon.sandbox.create();
let mockery = require("mockery");
let globals = require("../mocks/globals");
let testUtils = require("../test-utils");

describe("BuildPlanner", function() {
    let BuildPlanner;
    let room = {
        name : "testRoom",
        spawns : ["spawn1"],
        sources : [{
            pos : {
                x : 5,
                y : 40,
            },
        }, {
            pos : {
                x : 35,
                y : 30,
            },
        }],
        controller : {
            pos : {
                x : 20,
                y : 26,
            },
        },
        tasksInfo : {},
        pathManager : {
            pathsInfo : {},
        },
        sourceManager : {
            sources : [{}, {}],
        },
    };
    let math;

    before(function() {
        mockery.enable({ useCleanCache: true });
        testUtils.registerAllowables(mockery, "utils", "math", "constants", "base.class", "event.bus", "build.list", "build.spawn", "build.container", "build.extension", "build.road", "build.wall", "build.tower", "build.planner");
        globals.init(sandbox);

        mockery.registerAllowable("../../default/build.planner");
        BuildPlanner = require("../../default/build.planner");
        math = require("math");

        Game.spawns["spawn1"] = {
            pos : {
                x : 16,
                y : 34,
            },
        };
        room.lookForAt = sandbox.stub();
        room.findPath = sandbox.stub();
        room.sources[0].isEqualTo = sandbox.stub();
        room.sources[1].isEqualTo = sandbox.stub();
        room.controller.isEqualTo = sandbox.stub();
        room.pathManager.addPath = sandbox.stub();
        room.pathManager.pathsInfo[0] = testUtils.getPathInfo("15331556666677777", math);
        room.pathManager.pathsInfo[1] = testUtils.getPathInfo("1533133332223333224433333", math);
        room.pathManager.pathsInfo[2] = testUtils.getPathInfo("153311111222233333188865555", math);
    });

    describe("init", function() {
        let buildPlanner;

        before(function() {
            buildPlanner = new BuildPlanner("test");
        });

        beforeEach(function() {
            sandbox.reset();
            globals.stub();
            room.lookForAt.returns(["plain"]);
            room.sources[0].isEqualTo.returns(true);
            room.sources[1].isEqualTo.returns(true);
            room.controller.isEqualTo.returns(true);
            room.pathManager.addPath.returnsArg(0);
        });

        it("plan", function() {
            (buildPlanner.init(room)).should.be.equal(false);
            (buildPlanner.room).should.be.equal(room);
            (buildPlanner.center).should.be.eql({
                x : 15,
                y : 33,
            });
        });

        it("init spawn", function() {
            Game.cpu.tickLimit = 10;
            (buildPlanner.init(room)).should.be.equal(false);
            (buildPlanner.pathsInfo).should.be.eql([{
                paths : [ '16:34', '15:32', '14:33' ],
                type : "spawn",
            }]);
        });

        it("init road", function() {
            Game.cpu.tickLimit = 12;
            room.findPath.onFirstCall().returns(testUtils.deserializePath("1534556666677777"));
            room.findPath.onSecondCall().returns(testUtils.deserializePath("163333332223333224433333"));
            room.findPath.onThirdCall().returns(testUtils.deserializePath("15321111222233333188865555"));
            (buildPlanner.init(room)).should.be.equal(false);
            (buildPlanner.pathsInfo).should.be.eql([{
                paths : [ '16:34', '15:32', '14:33' ],
                type : "spawn",
            }, {
                paths : [
                    testUtils.deserializePath("15331556666677777"),
                    testUtils.deserializePath("1533133332223333224433333"),
                ],
                type : "road",
            }]);

            Game.cpu.tickLimit = 10;
            (buildPlanner.init(room)).should.be.equal(false);
            (buildPlanner.pathsInfo).should.be.eql([{
                paths : [ '16:34', '15:32', '14:33' ],
                type : "spawn",
            }, {
                paths : [
                    testUtils.deserializePath("15331556666677777"),
                    testUtils.deserializePath("1533133332223333224433333"),
                    testUtils.deserializePath("153311111222233333188865555"),
                ],
                type : "road",
            }]);
        });

        it("init container and tower", function() {
            Game.cpu.tickLimit = 23;

            (buildPlanner.init(room)).should.be.equal(false);
            (buildPlanner.pathsInfo).should.be.eql([{
                paths : [ '16:34', '15:32', '14:33' ],
                type : "spawn",
            }, {
                paths : [
                    testUtils.deserializePath("15331556666677777"),
                    testUtils.deserializePath("1533133332223333224433333"),
                    testUtils.deserializePath("153311111222233333188865555"),
                ],
                type : "road",
            }, {
                paths : [ '6:40', '34:30', '20:23' ],
                type : "container",
            }, {
                paths : [ '16:33', '14:34', '15:32', '15:34', '14:32', '16:32' ],
                type : "tower",
            }]);
        });

        it("init extensions", function() {
            Game.cpu.tickLimit = 15;

            (buildPlanner.init(room)).should.be.equal(false);
            (buildPlanner.pathsInfo).should.be.eql([{
                paths : [ '16:34', '15:32', '14:33' ],
                type : "spawn",
            }, {
                paths : [
                    testUtils.deserializePath("15331556666677777"),
                    testUtils.deserializePath("1533133332223333224433333"),
                    testUtils.deserializePath("153311111222233333188865555"),
                ],
                type : "road",
            }, {
                paths : [ '6:40', '34:30', '20:23' ],
                type : "container",
            }, {
                paths : [ '16:33', '14:34', '15:32', '15:34', '14:32', '16:32' ],
                type : "tower",
            }, {
                paths : [
                    "16:35","15:36","14:35","14:37","13:36",
                    "13:38","12:37","12:39","11:38","11:40",
                    "10:39","10:41","9:41","9:39","8:41",
                    "8:39","7:41","7:39","6:41","6:39",
                    "17:32","17:34","18:32","18:34","19:34",
                    "19:32","20:33","20:31","21:32","21:30",
                    "22:31","22:29","23:29","23:31","24:29",
                    "24:31","25:29","25:31","26:29","26:31",
                    "27:30","27:28","28:29","28:27","29:30",
                    "29:28","30:29","30:31","31:29","31:31",
                    "32:31","32:29","33:31","33:29","34:31",
                    "34:29","14:31","16:31","14:30","16:30",
                ],
                type : "extension",
            }]);
        });

        it("init walls", function() {
            Game.cpu.tickLimit = 18;
            Game.map.describeExits.returns({
                1 : "",
                3 : "",
                5 : "",
                7 : "",
            });
            testUtils.registerTerrainWalls([
                "00003x9",
                "15003",
                "45003x6",

                "00005x9x5",
                "00405x9x3",

                "49005x9",
                "49155x7",
                "49305x9x9x9",

                "00493x9",
                "20493x9x9x9x9x9",
            ], global.Game.map.getTerrainAt);
            room.findPath.returns(testUtils.deserializePath("000011"));

            (buildPlanner.init(room)).should.be.equal(true);
            (buildPlanner.pathsInfo).should.be.eql([{
                paths : [ '16:34', '15:32', '14:33' ],
                type : "spawn",
            }, {
                paths : [
                    testUtils.deserializePath("15331556666677777"),
                    testUtils.deserializePath("1533133332223333224433333"),
                    testUtils.deserializePath("153311111222233333188865555"),
                ],
                type : "road",
            }, {
                paths : [ '6:40', '34:30', '20:23' ],
                type : "container",
            }, {
                paths : [ '16:33', '14:34', '15:32', '15:34', '14:32', '16:32' ],
                type : "tower",
            }, {
                paths : [
                    "16:35","15:36","14:35","14:37","13:36",
                    "13:38","12:37","12:39","11:38","11:40",
                    "10:39","10:41","9:41","9:39","8:41",
                    "8:39","7:41","7:39","6:41","6:39",
                    "17:32","17:34","18:32","18:34","19:34",
                    "19:32","20:33","20:31","21:32","21:30",
                    "22:31","22:29","23:29","23:31","24:29",
                    "24:31","25:29","25:31","26:29","26:31",
                    "27:30","27:28","28:29","28:27","29:30",
                    "29:28","30:29","30:31","31:29","31:31",
                    "32:31","32:29","33:31","33:29","34:31",
                    "34:29","14:31","16:31","14:30","16:30",
                ],
                type : "extension",
            }, {
                paths : [
                    testUtils.deserializePath("0701553x9x9x9x9x71"),
                    testUtils.deserializePath("4807775x93"),
                    testUtils.deserializePath("4820775x9x33"),
                    testUtils.deserializePath("2148117x9x65"),
                    testUtils.deserializePath("0141331x9x9x9x67"),
                ],
                type : "wall",
            }]);
        });
    });

    after(function() {
        mockery.deregisterAll();
        mockery.disable();
        sandbox.restore();
        delete global.Memory;
    });
});
