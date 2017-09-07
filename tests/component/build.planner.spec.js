let sinon = require("sinon");
let should = require("should");
let sandbox = sinon.sandbox.create();
let mockery = require("mockery");
let globals = require("../mocks/globals");
let testUtils = require("../test-utils");

describe("BuildPlanner", function () {
    let BuildPlanner;
    let room = {
        name : "testRoom",
        spawns : ["spawn1"],
        sources : [{
            pos : {
                x : 10,
                y : 10,
            },
        }, {
            pos : {
                x : 39,
                y : 27,
            },
        }],
        controller : {
            pos : {
                x : 8,
                y : 26,
            },
        },
        mineral : {
            pos : {
                x : 37,
                y : 9,
            },
        },
        tasksInfo : {},
        sourceManager : {
            sources : [{}, {}],
        },
    };
    let math, PathManager;

    before(function () {
        globals.init(sandbox);
        mockery.enable({ useCleanCache: true });
        testUtils.registerAllowables(mockery, "utils", "math", "heap", "constants", "base.class", "event.bus", "build.list", "build.spawn", "build.container", "build.extension", "build.road", "build.wall", "build.tower", "build.planner", "path.manager", "path.info", "path.connection");

        mockery.registerAllowable("../../default/build.planner");
        BuildPlanner = require("../../default/build.planner");
        PathManager = require("path.manager");
        math = require("math");

        Game.spawns["spawn1"] = {
            pos : {
                x : 26,
                y : 21,
            },
        };
        room.lookForAt = sandbox.stub();
        room.findPath = sandbox.stub();
        room.sources[0].isEqualTo = sandbox.stub();
        room.sources[1].isEqualTo = sandbox.stub();
        room.controller.isEqualTo = sandbox.stub();
        room.pathManager = new PathManager("testPathManager");
    });

    describe("init", function () {
        let buildPlanner;

        before(function () {
            buildPlanner = new BuildPlanner("test");
        });

        beforeEach(function () {
            sandbox.reset();
            globals.stub();
            room.lookForAt.returns(["plain"]);
            room.sources[0].isEqualTo.returns(true);
            room.sources[1].isEqualTo.returns(true);
            room.controller.isEqualTo.returns(true);
        });

        it("plan", function () {
            (buildPlanner.init(room)).should.be.equal(false);
            (buildPlanner.room).should.be.equal(room);
            (buildPlanner.center).should.be.eql({
                x : 25,
                y : 20,
            });
        });

        it("init spawn", function () {
            Game.cpu.tickLimit = 10;
            (buildPlanner.init(room)).should.be.equal(false);
            (buildPlanner.pathsInfo).should.be.eql([{
                paths : [ '26:21', '25:19', '24:20' ],
                type : "spawn",
            }]);
        });

        it("init road", function () {
            Game.cpu.tickLimit = 12;
            room.findPath.onFirstCall().returns(testUtils.deserializePath("24207x88x7111"));
            room.findPath.onSecondCall().returns(testUtils.deserializePath("24207x87776x6"));
            room.findPath.onThirdCall().returns(testUtils.deserializePath("262034x73x6"));
            room.findPath.onCall(3).returns(testUtils.deserializePath("26203x42x8111"));
            (buildPlanner.init(room)).should.be.equal(false);
            (buildPlanner.pathsInfo).should.be.eql([{
                paths : [ '26:21', '25:19', '24:20' ],
                type : "spawn",
            }, {
                paths : [
                    testUtils.deserializePath("252017x88x7111"),
                    testUtils.deserializePath("17207x46x6"),
                ],
                type : "road",
            }]);

            Game.cpu.tickLimit = 12;
            (buildPlanner.init(room)).should.be.equal(false);
            (buildPlanner.pathsInfo).should.be.eql([{
                paths : [ '26:21', '25:19', '24:20' ],
                type : "spawn",
            }, {
                paths : [
                    testUtils.deserializePath("252017x88x7111"),
                    testUtils.deserializePath("17207x46x6"),
                    testUtils.deserializePath("2520134x73x6"),
                    testUtils.deserializePath("26203x42x8111"),
                ],
                type : "road",
            }]);
        });

        it("init walls", function () {
            Game.cpu.tickLimit = 16;
            Game.map.describeExits.returns({
                1 : "",
                3 : "",
                5 : "",
                7 : "",
            });
            testUtils.registerTerrainWalls([
                "00003x9",
                "15003",
                "20033x8",
                "45003x6",

                "00005x9x5",
                "00405x9x3",

                "49005x9",
                "49155x7",
                "49305x9x9x9",

                "00493x9",
                "20493x9x9x9x9x9",
            ], global.Game.map.getTerrainAt);
            room.findPath.withArgs(sinon.match({
                x : 14,
                y : 3,
            }), sinon.match({
                x : 16,
                y : 3,
            })).returns(testUtils.deserializePath("150333"));
            room.findPath.withArgs(sinon.match({
                x : 19,
                y : 3,
            }), sinon.match({
                x : 28,
                y : 3,
            })).returns(testUtils.deserializePath("2004443x522"));
            room.findPath.withArgs(sinon.match({
                x : 25,
                y : 20,
            }), sinon.match({
                x : 27,
                y : 4,
            })).returns(testUtils.deserializePath("25191x5881x8"));
            room.findPath.withArgs(sinon.match({
                x : 46,
                y : 14,
            }), sinon.match({
                x : 46,
                y : 22,
            })).returns(testUtils.deserializePath("46155x8"));
            room.findPath.withArgs(sinon.match({
                x : 25,
                y : 20,
            }), sinon.match({
                x : 46,
                y : 20,
            })).returns(testUtils.deserializePath("26204x83x92x4"));
            room.findPath.withArgs(sinon.match({
                x : 25,
                y : 20,
            }), sinon.match({
                x : 13,
                y : 46,
            })).returns(testUtils.deserializePath("24207x9776x65x95x954"));
            room.findPath.withArgs(sinon.match({
                x : 25,
                y : 20,
            }), sinon.match({
                x : 3,
                y : 25,
            })).returns(testUtils.deserializePath("24207x9776x67x5"));

            (buildPlanner.init(room)).should.be.equal(false);
            (buildPlanner.pathsInfo).should.be.eql([{
                paths : [ '26:21', '25:19', '24:20' ],
                type : "spawn",
            }, {
                paths : [
                    testUtils.deserializePath("252017x88x7111"),
                    testUtils.deserializePath("17207x46x6"),
                    testUtils.deserializePath("2520134x73x6"),
                    testUtils.deserializePath("26203x42x8111"),
                ],
                type : "road",
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

        it.skip("init container and tower", function () {
            Game.cpu.tickLimit = 23;

            (buildPlanner.init(room)).should.be.equal(false);
            (buildPlanner.pathsInfo).should.be.eql([{
                paths : [ '26:21', '25:19', '24:20' ],
                type : "spawn",
            }, {
                paths : [
                    testUtils.deserializePath("252017x88x7111"),
                    testUtils.deserializePath("17207x46x6"),
                    testUtils.deserializePath("2520134x73x6"),
                    testUtils.deserializePath("26203x42x8111"),
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

        it.skip("init extensions", function () {
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
                    "10:39","10:41","9:41","9:39","17:32",
                    "17:34","18:32","18:34","19:34","19:32",
                    "20:33","20:31","21:32","21:30","22:31",
                    "22:29","23:29","23:31","24:29","24:31",
                    "25:29","25:31","26:29","26:31","27:30",
                    "27:28","28:29","28:27","29:30","29:28",
                    "30:29","30:31","31:29","31:31","32:31",
                    "32:29","33:31","14:31","16:31","14:30",
                    "16:30","14:29","15:28","16:29","16:27",
                    "17:28","17:26","18:27","18:25","19:26",
                ],
                type : "extension",
            }]);
        });
    });

    after(function () {
        testUtils.visualize(50, 50,
            ..._.values(room.pathManager.pathsInfo).map(pathInfo => pathInfo.path)
        );

        mockery.deregisterAll();
        mockery.disable();
        sandbox.restore();
        delete global.Memory;
    });
});
