let sinon = require("sinon");
let should = require("should");
let sandbox = sinon.sandbox.create();
let mockery = require("mockery");
let globals = require("../mocks/globals");
let testUtils = require("../test-utils");

describe("PathManager", function () {
    let PathManager;

    before(function () {
        globals.init(sandbox);
        mockery.enable({ useCleanCache: true });
        testUtils.registerAllowables(mockery, "utils", "math", "heap", "constants", "base.class", "path.info", "path.connection");
        mockery.registerAllowable("../../default/path.manager");
        PathManager = require("../../default/path.manager");
    });

    it("Adding paths", function () {
        let pathManager = new PathManager("test");

        pathManager.addPath(testUtils.deserializePath("05054x83x54x7"));
        pathManager.addPath(testUtils.deserializePath("24097x46667x5666"));
        pathManager.addPath(testUtils.deserializePath("10152x93x5"));
        pathManager.addPath(testUtils.deserializePath("15208x622233555"));
        pathManager.addPath(testUtils.deserializePath("17223x8"));
        pathManager.addPath(testUtils.deserializePath("23205x6"));
        pathManager.addPath(testUtils.deserializePath("20231x52x4333"));

        testUtils.correctJSON(JSON.parse(JSON.stringify(pathManager.pathsInfo))).should.be.eql({
            0: {
                id: 0,
                path: testUtils.deserializePath("05054x83x54x7"),
                reverse: testUtils.deserializePath("24198x87x58x7"),
                connections: {
                    1: {
                        id: "pathConnection_2",
                        idx: 1,
                        pos: 12,
                        targetPos: 7
                    },
                    2: {
                        id: "pathConnection_4",
                        idx: 2,
                        pos: 8,
                        targetPos: 0
                    },
                    3: {
                        id: "pathConnection_6",
                        idx: 3,
                        pos: 8,
                        targetPos: 0
                    },
                    4: {
                        id: "pathConnection_4",
                        idx: 2,
                        pos: 8,
                        targetPos: 0
                    },
                    5: {
                        id: "pathConnection_12",
                        idx: 5,
                        pos: 10,
                        targetPos: 0
                    },
                    6: {
                        id: "pathConnection_16",
                        idx: 8,
                        pos: 17,
                        targetPos: 7
                    },
                    7: {
                        id: "pathConnection_16",
                        idx: 8,
                        pos: 17,
                        targetPos: 7
                    },
                    8: {
                        id: "pathConnection_16",
                        idx: 8,
                        pos: 17,
                        targetPos: 7
                    }
                },
                directConnections: [1, 2, 3, 5, 8],
            },
            1: {
                id: 1,
                path: testUtils.deserializePath("24097x46667"),
                reverse: testUtils.deserializePath("171233222333"),
                connections: {
                    0: {
                        id: "pathConnection_1",
                        idx: 0,
                        pos: 7,
                        targetPos: 12
                    },
                    2: {
                        id: "pathConnection_1",
                        idx: 0,
                        pos: 7,
                        targetPos: 12
                    },
                    3: {
                        id: "pathConnection_1",
                        idx: 0,
                        pos: 7,
                        targetPos: 12
                    },
                    4: {
                        id: "pathConnection_1",
                        idx: 0,
                        pos: 7,
                        targetPos: 12
                    },
                    5: {
                        id: "pathConnection_1",
                        idx: 0,
                        pos: 7,
                        targetPos: 12
                    },
                    6: {
                        id: "pathConnection_1",
                        idx: 0,
                        pos: 7,
                        targetPos: 12
                    },
                    7: {
                        id: "pathConnection_1",
                        idx: 0,
                        pos: 7,
                        targetPos: 12
                    },
                    8: {
                        id: "pathConnection_1",
                        idx: 0,
                        pos: 7,
                        targetPos: 12
                    }
                },
                directConnections: [0],
            },
            2: {
                id: 2,
                path: testUtils.deserializePath("13127666"),
                reverse: testUtils.deserializePath("10152x4"),
                connections: {
                    0: {
                        id: "pathConnection_3",
                        idx: 0,
                        pos: 0,
                        targetPos: 8
                    },
                    1: {
                        id: "pathConnection_3",
                        idx: 0,
                        pos: 0,
                        targetPos: 8
                    },
                    3: {
                        id: "pathConnection_8",
                        idx: 3,
                        pos: 0,
                        targetPos: 0
                    },
                    4: {
                        id: "pathConnection_10",
                        idx: 4,
                        pos: 3,
                        targetPos: 5
                    },
                    5: {
                        id: "pathConnection_3",
                        idx: 0,
                        pos: 0,
                        targetPos: 8
                    },
                    6: {
                        id: "pathConnection_3",
                        idx: 0,
                        pos: 0,
                        targetPos: 8
                    },
                    7: {
                        id: "pathConnection_3",
                        idx: 0,
                        pos: 0,
                        targetPos: 8
                    },
                    8: {
                        id: "pathConnection_3",
                        idx: 0,
                        pos: 0,
                        targetPos: 8
                    }
                },
                directConnections: [0, 3, 4],
            },
            3: {
                id: 3,
                path: testUtils.deserializePath("13122x63x5"),
                reverse: testUtils.deserializePath("23077x66x5"),
                connections: {
                    0: {
                        id: "pathConnection_5",
                        idx: 0,
                        pos: 0,
                        targetPos: 8
                    },
                    1: {
                        id: "pathConnection_5",
                        idx: 0,
                        pos: 0,
                        targetPos: 8
                    },
                    2: {
                        id: "pathConnection_7",
                        idx: 2,
                        pos: 0,
                        targetPos: 0
                    },
                    4: {
                        id: "pathConnection_7",
                        idx: 2,
                        pos: 0,
                        targetPos: 0
                    },
                    5: {
                        id: "pathConnection_5",
                        idx: 0,
                        pos: 0,
                        targetPos: 8
                    },
                    6: {
                        id: "pathConnection_5",
                        idx: 0,
                        pos: 0,
                        targetPos: 8
                    },
                    7: {
                        id: "pathConnection_5",
                        idx: 0,
                        pos: 0,
                        targetPos: 8
                    },
                    8: {
                        id: "pathConnection_5",
                        idx: 0,
                        pos: 0,
                        targetPos: 8
                    }
                },
                directConnections: [0, 2],
            },
            4: {
                id: 4,
                path: testUtils.deserializePath("15208x6"),
                reverse: testUtils.deserializePath("10154x6"),
                connections: {
                    0: {
                        id: "pathConnection_9",
                        idx: 2,
                        pos: 5,
                        targetPos: 3
                    },
                    1: {
                        id: "pathConnection_9",
                        idx: 2,
                        pos: 5,
                        targetPos: 3
                    },
                    2: {
                        id: "pathConnection_9",
                        idx: 2,
                        pos: 5,
                        targetPos: 3
                    },
                    3: {
                        id: "pathConnection_9",
                        idx: 2,
                        pos: 5,
                        targetPos: 3
                    },
                    5: {
                        id: "pathConnection_9",
                        idx: 2,
                        pos: 5,
                        targetPos: 3
                    },
                    6: {
                        id: "pathConnection_9",
                        idx: 2,
                        pos: 5,
                        targetPos: 3
                    },
                    7: {
                        id: "pathConnection_9",
                        idx: 2,
                        pos: 5,
                        targetPos: 3
                    },
                    8: {
                        id: "pathConnection_9",
                        idx: 2,
                        pos: 5,
                        targetPos: 3
                    }
                },
                directConnections: [2],
            },
            5: {
                id: 5,
                path: testUtils.deserializePath("15123555"),
                reverse: testUtils.deserializePath("15151x4"),
                connections: {
                    0: {
                        id: "pathConnection_11",
                        idx: 0,
                        pos: 0,
                        targetPos: 10
                    },
                    1: {
                        id: "pathConnection_11",
                        idx: 0,
                        pos: 0,
                        targetPos: 10
                    },
                    2: {
                        id: "pathConnection_11",
                        idx: 0,
                        pos: 0,
                        targetPos: 10
                    },
                    3: {
                        id: "pathConnection_11",
                        idx: 0,
                        pos: 0,
                        targetPos: 10
                    },
                    4: {
                        id: "pathConnection_11",
                        idx: 0,
                        pos: 0,
                        targetPos: 10
                    },
                    6: {
                        id: "pathConnection_11",
                        idx: 0,
                        pos: 0,
                        targetPos: 10
                    },
                    7: {
                        id: "pathConnection_11",
                        idx: 0,
                        pos: 0,
                        targetPos: 10
                    },
                    8: {
                        id: "pathConnection_11",
                        idx: 0,
                        pos: 0,
                        targetPos: 10
                    }
                },
                directConnections: [0],
            },
            6: {
                id: 6,
                path: testUtils.deserializePath("17223x8"),
                reverse: testUtils.deserializePath("24227x8"),
                connections: {
                    0: {
                        id: "pathConnection_18",
                        idx: 8,
                        pos: 3,
                        targetPos: 2
                    },
                    1: {
                        id: "pathConnection_18",
                        idx: 8,
                        pos: 3,
                        targetPos: 2
                    },
                    2: {
                        id: "pathConnection_18",
                        idx: 8,
                        pos: 3,
                        targetPos: 2
                    },
                    3: {
                        id: "pathConnection_18",
                        idx: 8,
                        pos: 3,
                        targetPos: 2
                    },
                    4: {
                        id: "pathConnection_18",
                        idx: 8,
                        pos: 3,
                        targetPos: 2
                    },
                    5: {
                        id: "pathConnection_18",
                        idx: 8,
                        pos: 3,
                        targetPos: 2
                    },
                    7: {
                        id: "pathConnection_14",
                        idx: 7,
                        pos: 6,
                        targetPos: 3
                    },
                    8: {
                        id: "pathConnection_18",
                        idx: 8,
                        pos: 3,
                        targetPos: 2
                    },
                },
                directConnections: [7, 8],
            },
            7: {
                id: 7,
                path: testUtils.deserializePath("23205x6"),
                reverse: testUtils.deserializePath("23251x6"),
                connections: {
                    0: {
                        id: "pathConnection_13",
                        idx: 6,
                        pos: 3,
                        targetPos: 6
                    },
                    1: {
                        id: "pathConnection_13",
                        idx: 6,
                        pos: 3,
                        targetPos: 6
                    },
                    2: {
                        id: "pathConnection_13",
                        idx: 6,
                        pos: 3,
                        targetPos: 6
                    },
                    3: {
                        id: "pathConnection_13",
                        idx: 6,
                        pos: 3,
                        targetPos: 6
                    },
                    4: {
                        id: "pathConnection_13",
                        idx: 6,
                        pos: 3,
                        targetPos: 6
                    },
                    5: {
                        id: "pathConnection_13",
                        idx: 6,
                        pos: 3,
                        targetPos: 6
                    },
                    6: {
                        id: "pathConnection_13",
                        idx: 6,
                        pos: 3,
                        targetPos: 6
                    },
                    8: {
                        id: "pathConnection_13",
                        idx: 6,
                        pos: 3,
                        targetPos: 6
                    }
                },
                directConnections: [6],
            },
            8: {
                id: 8,
                path: testUtils.deserializePath("20231x52x4333"),
                reverse: testUtils.deserializePath("27157x46x45x4"),
                connections: {
                    0: {
                        id: "pathConnection_15",
                        idx: 0,
                        pos: 7,
                        targetPos: 17
                    },
                    1: {
                        id: "pathConnection_15",
                        idx: 0,
                        pos: 7,
                        targetPos: 17
                    },
                    2: {
                        id: "pathConnection_15",
                        idx: 0,
                        pos: 7,
                        targetPos: 17
                    },
                    3: {
                        id: "pathConnection_15",
                        idx: 0,
                        pos: 7,
                        targetPos: 17
                    },
                    4: {
                        id: "pathConnection_15",
                        idx: 0,
                        pos: 7,
                        targetPos: 17
                    },
                    5: {
                        id: "pathConnection_15",
                        idx: 0,
                        pos: 7,
                        targetPos: 17
                    },
                    6: {
                        id: "pathConnection_17",
                        idx: 6,
                        pos: 2,
                        targetPos: 3
                    },
                    7: {
                        id: "pathConnection_17",
                        idx: 6,
                        pos: 2,
                        targetPos: 3
                    }
                },
                directConnections: [0, 6],
            },
        });

        // testUtils.visualize(30, 30,
        //     ..._.values(pathManager.pathsInfo).map(pathInfo => pathInfo.path)
        // );
    });

    it("Moving creep to target in same path", function () {
        let pathManager = new PathManager("test");
        let creep = {
            name : "testCreep",
            move : sandbox.stub().returns(OK),
            pathIdx : 0,
            pathPos : 0,
            targetPathPos : 0,
        };
        let target = {
            pathIdx : 0,
            pathPos : 6,
        };

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
            returnValue : "creepReachedTarget",
            pathIdx : 0,
            pathPos : 6,
            targetPathPos : 6,
        }].forEach((testData) => {
            (pathManager.moveCreep(creep, target)).should.be.equal(testData.returnValue);

            (creep.pathIdx).should.be.equal(testData.pathIdx);
            (creep.pathPos).should.be.equal(testData.pathPos);
            (creep.targetPathPos).should.be.equal(testData.targetPathPos);

            delete creep.hasMoved;
            delete creep.processed;
            delete creep.swapPos;
        });

        pathManager.creepHasDied(creep);
        (pathManager.pathsInfo[0].creeps).should.be.eql({});
    });

    it("Moving creep to target in next path", function () {
        let pathManager = new PathManager("test");
        let creep = {
            name : "testCreep",
            move : sandbox.stub().returns(OK),
            pathIdx : 0,
            pathPos : 8,
            targetPathPos : 8,
        };
        let target = {
            pathIdx : 1,
            pathPos : 5,
        };

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
            returnValue : "creepReachedTarget",
            pathIdx : 1,
            pathPos : 5,
            targetPathPos : 5,
        }].forEach((testData, i) => {
            (pathManager.moveCreep(creep, target)).should.be.equal(testData.returnValue);

            (creep.pathIdx).should.be.equal(testData.pathIdx);
            (creep.pathPos).should.be.equal(testData.pathPos);
            (creep.targetPathPos).should.be.equal(testData.targetPathPos);

            delete creep.hasMoved;
            delete creep.processed;
            delete creep.swapPos;
        });

        pathManager.creepHasDied(creep);
        (pathManager.pathsInfo[0].creeps).should.be.eql({});
        (pathManager.pathsInfo[1].creeps).should.be.eql({});
    });

    it("Moving creep to target 2 paths out", function () {
        let pathManager = new PathManager("test");
        let creep = {
            name : "testCreep",
            move : sandbox.stub().returns(OK),
            pathIdx : 0,
            pathPos : 4,
            targetPathPos : 4,
        };
        let target = {
            pathIdx : 4,
            pathPos : 2,
        };

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
            returnValue : "creepReachedTarget",
            pathIdx : 4,
            pathPos : 2,
            targetPathPos : 2,
        }].forEach((testData) => {
            (pathManager.moveCreep(creep, target)).should.be.equal(testData.returnValue);

            (creep.pathIdx).should.be.equal(testData.pathIdx);
            (creep.pathPos).should.be.equal(testData.pathPos);
            (creep.targetPathPos).should.be.equal(testData.targetPathPos);

            delete creep.hasMoved;
            delete creep.processed;
            delete creep.swapPos;
        });

        pathManager.creepHasDied(creep);
        (pathManager.pathsInfo[0].creeps).should.be.eql({});
        (pathManager.pathsInfo[2].creeps).should.be.eql({});
        (pathManager.pathsInfo[3].creeps).should.be.eql({});
    });

    describe("Moving creep with other creeps on the same path", function () {
        let pathManager;
        let creep, otherCreeps;

        before(function () {
            pathManager = new PathManager("test");
            creep = {
                name : "testCreep",
                move : sandbox.stub().returns(OK),
                pathIdx : 0,
                pathPos : 2,
                targetPathPos : 7,
            };
            Game.creeps[creep.name] = creep;
            otherCreeps = [{
                name : "testCreep1",
                move : sandbox.stub().returns(OK),
                pathIdx : 0,
                pathPos : 3,
                targetPathPos : 5,
            }, {
                name : "testCreep2",
                move : sandbox.stub().returns(OK),
                pathIdx : 0,
                pathPos : 4,
                targetPathPos : 4,
            }, {
                name : "testCreep3",
                move : sandbox.stub().returns(OK),
                pathIdx : 0,
                pathPos : 5,
                targetPathPos : 5,
            }, {
                name : "testCreep4",
                move : sandbox.stub().returns(OK),
                pathIdx : 0,
                pathPos : 6,
                targetPathPos : 2,
            }, {
                name : "testCreep5",
                move : sandbox.stub().returns(OK),
                pathIdx : 0,
                pathPos : 8,
                targetPathPos : 2,
            }];
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
                4 : ["testCreep1"],
            },
        }, {
            title : "stationary",
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
                3 : ["testCreep2"],
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
                4 : ["testCreep3"],
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
                5 : ["testCreep4"],
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
                returnValue : "couldntMove",
                pathIdx : 0,
                pathPos : 6,
                targetPathPos : 7,
            },
            creeps : {
                6 : ["testCreep"],
                7 : ["testCreep5"],
            },
        }].forEach((testData) => {
            it(testData.title, () => {
                let otherCreep = otherCreeps[testData.otherCreep.creep];
                Game.creeps[otherCreep.name] = otherCreep;
                pathManager.pathsInfo[testData.otherCreep.pathIdx].creeps[otherCreep.pathPos] = [otherCreep.name];
                if (testData.pre) {
                    pathManager.moveCreep(otherCreep, {});
                }

                (pathManager.moveCreep(creep, {})).should.be.equal(testData.creep.returnValue);

                if (testData.post) {
                    pathManager.moveCreep(otherCreep, {});
                }

                (creep.pathIdx).should.be.equal(testData.creep.pathIdx);
                (creep.pathPos).should.be.equal(testData.creep.pathPos);
                (creep.targetPathPos).should.be.equal(testData.creep.targetPathPos);

                (otherCreep.pathIdx).should.be.equal(testData.otherCreep.pathIdx);
                (otherCreep.pathPos).should.be.equal(testData.otherCreep.pathPos);
                (otherCreep.targetPathPos).should.be.equal(testData.otherCreep.targetPathPos);

                pathManager.creepHasDied(otherCreep);

            });
        });

        it("creeps is empty for pathInfo of path 0", function () {
            pathManager.creepHasDied(creep);
            (pathManager.pathsInfo[0].creeps).should.be.eql({});
        })

        afterEach(function () {
            delete creep.hasMoved;
            delete creep.processed;
            delete creep.swapPos;
        });
    });

    describe("Moving creep with other creeps on the different paths", function () {
        let pathManager, move;

        before(function () {
            pathManager = new PathManager("test");
            move = sandbox.stub().returns(OK);
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
                    returnValue : "couldntMove",
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
                    returnValue : "creepReachedTarget",
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
                    returnValue : "creepReachedTarget",
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
        }].forEach((testData) => {
            it (testData.title, () => {
                testData.creeps.forEach((creepData) => {
                    Game.creeps[creepData.creep.name] = creepData.creep;
                    creepData.creep.move = move;
                    pathManager.pathsInfo[creepData.creep.pathIdx].creeps[creepData.creep.pathPos] = [creepData.creep.name];
                });

                testData.creeps.forEach((creepData) => {
                    (pathManager.moveCreep(creepData.creep, creepData.target)).should.be.equal(creepData.result.returnValue);
                });

                testData.creeps.forEach((creepData) => {
                    (creepData.creep.pathIdx).should.be.equal(creepData.result.pathIdx);
                    (creepData.creep.pathPos).should.be.equal(creepData.result.pathPos);
                });

                for (let pathIdx in testData.creepsInfo) {
                    (pathManager.pathsInfo[pathIdx].creeps).should.be.eql(testData.creepsInfo[pathIdx]);
                }

                testData.creeps.forEach((creepData) => {
                    pathManager.creepHasDied(creepData.creep);
                });

                for (let pathIdx in testData.creepsInfo) {
                    (pathManager.pathsInfo[pathIdx].creeps).should.be.eql({});
                }
            });
        });
    });

    describe("Moving creep away and towards the path", function () {
        let pathManager, move;

        before(function () {
            pathManager = new PathManager("test");
            move = sandbox.stub();
        });

        beforeEach(function () {
            sandbox.reset();

            globals.stub();
            move.returns(OK);
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
                    returnValue : "creepReachedTarget",
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
                    returnValue : "creepReachedTarget",
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
                    returnValue : "creepReachedTarget",
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
                    returnValue : "creepReachedTarget",
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
                    returnValue : "creepReachedTarget",
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
                    returnValue : "creepReachedTarget",
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
                    returnValue : "couldntMove",
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
                    returnValue : "couldntMove",
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
                    returnValue : "creepReachedTarget",
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
                    returnValue : "couldntMove",
                },
            }],
            creepsInfo : {
                0 : {
                    0 : ["creep3"],
                    1 : ["creep1", "creep2"],
                },
            },
        }].forEach((testData) => {
            it (testData.title, () => {
                testData.creeps.forEach((creepData, i) => {
                    Game.creeps[creepData.creep.name] = creepData.creep;
                    creepData.creep.move = move;
                    creepData.creep.pos = {
                        isEqualTo : sandbox.stub().returns(creepData.target.isEqualTo),
                    };
                    pathManager.pathsInfo[creepData.creep.pathIdx].creeps[creepData.creep.pathPos] =
                        pathManager.pathsInfo[creepData.creep.pathIdx].creeps[creepData.creep.pathPos] || [];
                    pathManager.pathsInfo[creepData.creep.pathIdx].creeps[creepData.creep.pathPos].push(creepData.creep.name);
                });

                testData.creeps.forEach((creepData) => {
                    //console.log(creepData.creep.name, creepData.result.returnValue);
                    (pathManager.moveCreep(creepData.creep, creepData.target)).should.be.equal(creepData.result.returnValue);
                });

                testData.creeps.forEach((creepData) => {
                    //console.log(creepData.creep.name);
                    (creepData.creep.pathIdx).should.be.equal(creepData.result.pathIdx);
                    (creepData.creep.pathPos).should.be.equal(creepData.result.pathPos);
                    (creepData.creep.movedAway).should.be.equal(creepData.result.movedAway);
                    (creepData.creep.targetPathPos).should.be.equal(creepData.result.targetPathPos);
                });

                for (let pathIdx in testData.creepsInfo) {
                    (pathManager.pathsInfo[pathIdx].creeps).should.be.containDeep(testData.creepsInfo[pathIdx]);
                }

                testData.creeps.forEach((creepData) => {
                    pathManager.creepHasDied(creepData.creep);
                });

                for (let pathIdx in testData.creepsInfo) {
                    (pathManager.pathsInfo[pathIdx].creeps).should.be.eql({});
                }
            });
        });
    });

    // it("generate", function () {
    //     let pathManager = new PathManager("generate");
    //
    //     pathManager.addPath(testUtils.deserializePath("25207x98x7111"));
    //     pathManager.addPath(testUtils.deserializePath("25207x97776x6"));
    //     pathManager.addPath(testUtils.deserializePath("2520334x73x6"));
    //     pathManager.addPath(testUtils.deserializePath("25203x52x8111"));
    //     testUtils.visualize(50, 50,
    //         ..._.values(pathManager.pathsInfo).map(pathInfo => pathInfo.path)
    //     );
    // });

    after(function () {
        mockery.deregisterAll();
        mockery.disable();
        sandbox.restore();
        delete global.Memory;
    });
});
