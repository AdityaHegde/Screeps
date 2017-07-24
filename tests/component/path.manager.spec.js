let sinon = require("sinon");
let should = require("should");
let sandbox = sinon.sandbox.create();
let mockery = require("mockery");
let globals = require("../mocks/globals");
let testUtils = require("../test-utils");

describe("PathManager", function() {
    let PathManager;

    before(function() {
        mockery.enable({ useCleanCache: true });
        testUtils.registerAllowables(mockery, "utils", "math", "constants", "base.class", "path.info", "path.connection");
        globals.init(sandbox);
        mockery.registerAllowable("../../default/path.manager");
        PathManager = require("../../default/path.manager");
    });

    it("Adding paths", function() {
        let pathManager = new PathManager("test");

        pathManager.addPath(testUtils.getPathFromDirections(BOTTOM, BOTTOM_LEFT, BOTTOM, BOTTOM_RIGHT, RIGHT, RIGHT, TOP_RIGHT, TOP_RIGHT, TOP_RIGHT, TOP), {});
        pathManager.addPath(testUtils.getPathFromDirections(TOP, TOP, TOP, TOP_LEFT, TOP_LEFT, LEFT, LEFT, TOP_LEFT, LEFT, LEFT), {
            0 : {
                fromPos : 5,
                toPos : 4,
            },
        });
        pathManager.addPath(testUtils.getPathFromDirections(TOP_RIGHT, TOP_RIGHT, TOP, TOP, TOP, TOP_RIGHT, TOP_RIGHT, RIGHT, RIGHT, TOP_RIGHT, TOP_RIGHT), {
            0 : {
                fromPos : 2,
                toPos : 7,
            },
            1 : {
                fromPos : 1,
                toPos : 3,
            },
        });
        pathManager.addPath(testUtils.getPathFromDirections(RIGHT, RIGHT, RIGHT, BOTTOM, BOTTOM, BOTTOM_RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM, BOTTOM_LEFT, BOTTOM_LEFT, BOTTOM_LEFT), {
            2 : {
                fromPos : 3,
                toPos : 6,
            },
        });
        pathManager.addPath(testUtils.getPathFromDirections(RIGHT, RIGHT, RIGHT, BOTTOM, BOTTOM, BOTTOM_RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM, BOTTOM_LEFT, BOTTOM_LEFT, BOTTOM_LEFT), {
            2 : {
                fromPos : 3,
                toPos : 4,
            },
            3 : {
                fromPos : 6,
                toPos : 4,
            },
        });

        (pathManager.pathsInfo[0].connections[1].idx).should.be.equal(1);
        (pathManager.pathsInfo[0].connections[1].pos).should.be.equal(5);
        (pathManager.pathsInfo[0].connections[1].targetPos).should.be.equal(4);
        (pathManager.pathsInfo[0].connections[1].id).should.be.equal("pathConnection_2");
        (pathManager.pathsInfo[0].connections[2].idx).should.be.equal(2);
        (pathManager.pathsInfo[0].connections[2].pos).should.be.equal(2);
        (pathManager.pathsInfo[0].connections[2].targetPos).should.be.equal(7);
        (pathManager.pathsInfo[0].connections[2].id).should.be.equal("pathConnection_4");
        (pathManager.pathsInfo[0].connections[3].idx).should.be.equal(2);
        (pathManager.pathsInfo[0].connections[3].pos).should.be.equal(2);
        (pathManager.pathsInfo[0].connections[3].targetPos).should.be.equal(7);
        (pathManager.pathsInfo[0].connections[3].id).should.be.equal("pathConnection_4");
        (pathManager.pathsInfo[0].connections[4].idx).should.be.equal(2);
        (pathManager.pathsInfo[0].connections[4].pos).should.be.equal(2);
        (pathManager.pathsInfo[0].connections[4].targetPos).should.be.equal(7);
        (pathManager.pathsInfo[0].connections[4].id).should.be.equal("pathConnection_4");
        (pathManager.pathsInfo[0].directConnections).should.be.containDeep([1, 2]);

        (pathManager.pathsInfo[1].connections[0].idx).should.be.equal(0);
        (pathManager.pathsInfo[1].connections[0].pos).should.be.equal(4);
        (pathManager.pathsInfo[1].connections[0].targetPos).should.be.equal(5);
        (pathManager.pathsInfo[1].connections[0].id).should.be.equal("pathConnection_1");
        (pathManager.pathsInfo[1].connections[2].idx).should.be.equal(2);
        (pathManager.pathsInfo[1].connections[2].pos).should.be.equal(1);
        (pathManager.pathsInfo[1].connections[2].targetPos).should.be.equal(3);
        (pathManager.pathsInfo[1].connections[2].id).should.be.equal("pathConnection_6");
        (pathManager.pathsInfo[1].connections[3].idx).should.be.equal(2);
        (pathManager.pathsInfo[1].connections[3].pos).should.be.equal(1);
        (pathManager.pathsInfo[1].connections[3].targetPos).should.be.equal(3);
        (pathManager.pathsInfo[1].connections[3].id).should.be.equal("pathConnection_6");
        (pathManager.pathsInfo[1].connections[4].idx).should.be.equal(2);
        (pathManager.pathsInfo[1].connections[4].pos).should.be.equal(1);
        (pathManager.pathsInfo[1].connections[4].targetPos).should.be.equal(3);
        (pathManager.pathsInfo[1].connections[4].id).should.be.equal("pathConnection_6");
        (pathManager.pathsInfo[1].directConnections).should.be.containDeep([0, 2]);

        (pathManager.pathsInfo[2].connections[0].idx).should.be.equal(0);
        (pathManager.pathsInfo[2].connections[0].pos).should.be.equal(7);
        (pathManager.pathsInfo[2].connections[0].targetPos).should.be.equal(2);
        (pathManager.pathsInfo[2].connections[0].id).should.be.equal("pathConnection_3");
        (pathManager.pathsInfo[2].connections[1].idx).should.be.equal(1);
        (pathManager.pathsInfo[2].connections[1].pos).should.be.equal(3);
        (pathManager.pathsInfo[2].connections[1].targetPos).should.be.equal(1);
        (pathManager.pathsInfo[2].connections[1].id).should.be.equal("pathConnection_5");
        (pathManager.pathsInfo[2].connections[3].idx).should.be.equal(3);
        (pathManager.pathsInfo[2].connections[3].pos).should.be.equal(3);
        (pathManager.pathsInfo[2].connections[3].targetPos).should.be.equal(6);
        (pathManager.pathsInfo[2].connections[3].id).should.be.equal("pathConnection_8");
        (pathManager.pathsInfo[2].connections[4].idx).should.be.equal(4);
        (pathManager.pathsInfo[2].connections[4].pos).should.be.equal(3);
        (pathManager.pathsInfo[2].connections[4].targetPos).should.be.equal(4);
        (pathManager.pathsInfo[2].connections[4].id).should.be.equal("pathConnection_10");
        (pathManager.pathsInfo[2].directConnections).should.be.containDeep([0, 1, 3, 4]);

        (pathManager.pathsInfo[3].connections[0].idx).should.be.equal(2);
        (pathManager.pathsInfo[3].connections[0].pos).should.be.equal(6);
        (pathManager.pathsInfo[3].connections[0].targetPos).should.be.equal(3);
        (pathManager.pathsInfo[3].connections[0].id).should.be.equal("pathConnection_7");
        (pathManager.pathsInfo[3].connections[1].idx).should.be.equal(2);
        (pathManager.pathsInfo[3].connections[1].pos).should.be.equal(6);
        (pathManager.pathsInfo[3].connections[1].targetPos).should.be.equal(3);
        (pathManager.pathsInfo[3].connections[1].id).should.be.equal("pathConnection_7");
        (pathManager.pathsInfo[3].connections[2].idx).should.be.equal(2);
        (pathManager.pathsInfo[3].connections[2].pos).should.be.equal(6);
        (pathManager.pathsInfo[3].connections[2].targetPos).should.be.equal(3);
        (pathManager.pathsInfo[3].connections[2].id).should.be.equal("pathConnection_7");
        (pathManager.pathsInfo[3].connections[4].idx).should.be.equal(4);
        (pathManager.pathsInfo[3].connections[4].pos).should.be.equal(6);
        (pathManager.pathsInfo[3].connections[4].targetPos).should.be.equal(4);
        (pathManager.pathsInfo[3].connections[4].id).should.be.equal("pathConnection_12");
        (pathManager.pathsInfo[3].directConnections).should.be.containDeep([2, 4]);

        (pathManager.pathsInfo[4].connections[0].idx).should.be.equal(2);
        (pathManager.pathsInfo[4].connections[0].pos).should.be.equal(4);
        (pathManager.pathsInfo[4].connections[0].targetPos).should.be.equal(3);
        (pathManager.pathsInfo[4].connections[0].id).should.be.equal("pathConnection_9");
        (pathManager.pathsInfo[4].connections[1].idx).should.be.equal(2);
        (pathManager.pathsInfo[4].connections[1].pos).should.be.equal(4);
        (pathManager.pathsInfo[4].connections[1].targetPos).should.be.equal(3);
        (pathManager.pathsInfo[4].connections[1].id).should.be.equal("pathConnection_9");
        (pathManager.pathsInfo[4].connections[2].idx).should.be.equal(2);
        (pathManager.pathsInfo[4].connections[2].pos).should.be.equal(4);
        (pathManager.pathsInfo[4].connections[2].targetPos).should.be.equal(3);
        (pathManager.pathsInfo[4].connections[2].id).should.be.equal("pathConnection_9");
        (pathManager.pathsInfo[4].connections[3].idx).should.be.equal(3);
        (pathManager.pathsInfo[4].connections[3].pos).should.be.equal(4);
        (pathManager.pathsInfo[4].connections[3].targetPos).should.be.equal(6);
        (pathManager.pathsInfo[4].connections[3].id).should.be.equal("pathConnection_11");
        (pathManager.pathsInfo[4].directConnections).should.be.containDeep([2, 3]);
    });

    it("Moving creep to target in same path", function() {
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

    it("Moving creep to target in next path", function() {
        let pathManager = new PathManager("test");
        let creep = {
            name : "testCreep",
            move : sandbox.stub().returns(OK),
            pathIdx : 0,
            pathPos : 0,
            targetPathPos : 0,
        };
        let target = {
            pathIdx : 1,
            pathPos : 8,
        };

        [{
            returnValue : OK,
            pathIdx : 0,
            pathPos : 1,
            targetPathPos : 5,
        }, {
            returnValue : OK,
            pathIdx : 0,
            pathPos : 2,
            targetPathPos : 5,
        }, {
            returnValue : OK,
            pathIdx : 0,
            pathPos : 3,
            targetPathPos : 5,
        }, {
            returnValue : OK,
            pathIdx : 0,
            pathPos : 4,
            targetPathPos : 5,
        }, {
            returnValue : OK,
            pathIdx : 0,
            pathPos : 5,
            targetPathPos : 5,
        }, {
            returnValue : OK,
            pathIdx : 1,
            pathPos : 5,
            targetPathPos : 8,
        }, {
            returnValue : OK,
            pathIdx : 1,
            pathPos : 6,
            targetPathPos : 8,
        }, {
            returnValue : OK,
            pathIdx : 1,
            pathPos : 7,
            targetPathPos : 8,
        }, {
            returnValue : "creepReachedTarget",
            pathIdx : 1,
            pathPos : 8,
            targetPathPos : 8,
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
        (pathManager.pathsInfo[1].creeps).should.be.eql({});
    });

    it("Moving creep to target 2 paths out", function() {
        let pathManager = new PathManager("test");
        let creep = {
            name : "testCreep",
            move : sandbox.stub().returns(OK),
            pathIdx : 0,
            pathPos : 0,
            targetPathPos : 0,
        };
        let target = {
            pathIdx : 3,
            pathPos : 8,
        };

        [{
            returnValue : OK,
            pathIdx : 0,
            pathPos : 1,
            targetPathPos : 2,
        }, {
            returnValue : OK,
            pathIdx : 0,
            pathPos : 2,
            targetPathPos : 2,
        }, {
            returnValue : OK,
            pathIdx : 2,
            pathPos : 6,
            targetPathPos : 3,
        }, {
            returnValue : OK,
            pathIdx : 2,
            pathPos : 5,
            targetPathPos : 3,
        }, {
            returnValue : OK,
            pathIdx : 2,
            pathPos : 4,
            targetPathPos : 3,
        }, {
            returnValue : OK,
            pathIdx : 2,
            pathPos : 3,
            targetPathPos : 3,
        }, {
            returnValue : OK,
            pathIdx : 3,
            pathPos : 7,
            targetPathPos : 8,
        }, {
            returnValue : "creepReachedTarget",
            pathIdx : 3,
            pathPos : 8,
            targetPathPos : 8,
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

    describe("Moving creep with other creeps on the same path", function() {
        let pathManager;
        let creep, otherCreeps;

        before(function() {
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

        it("creeps is empty for pathInfo of path 0", function() {
            pathManager.creepHasDied(creep);
            (pathManager.pathsInfo[0].creeps).should.be.eql({});
        })

        afterEach(function() {
            delete creep.hasMoved;
            delete creep.processed;
            delete creep.swapPos;
        });
    });

    describe("Moving creep with other creeps on the different paths", function() {
        let pathManager, move;

        before(function() {
            pathManager = new PathManager("test");
            move = sandbox.stub().returns(OK);
        });

        [{
            title : "one moving past, one blocking another",
            creeps : [{
                creep : {
                    name : "creep1",
                    pathIdx : 0,
                    pathPos : 1,
                    targetPathPos : 7,
                },
                target : {},
                result : {
                    pathIdx : 0,
                    pathPos : 1,
                    returnValue : "couldntMove",
                },
            }, {
                creep : {
                    name : "creep2",
                    pathIdx : 2,
                    pathPos : 7,
                    targetPathPos : 2,
                },
                target : {},
                result : {
                    pathIdx : 2,
                    pathPos : 6,
                    returnValue : "ok",
                },
            }, {
                creep : {
                    name : "creep3",
                    pathIdx : 2,
                    pathPos : 6,
                    targetPathPos : 8,
                },
                target : {},
                result : {
                    pathIdx : 2,
                    pathPos : 7,
                    returnValue : "ok",
                },
            }],
            creepsInfo : {
                0 : {
                    1 : ["creep1"],
                },
                2 : {
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
                    pathPos : 1,
                    targetPathPos : 7,
                },
                target : {},
                result : {
                    pathIdx : 0,
                    pathPos : 2,
                    returnValue : "ok",
                },
            }, {
                creep : {
                    name : "creep2",
                    pathIdx : 2,
                    pathPos : 7,
                    targetPathPos : 7,
                },
                target : {},
                result : {
                    pathIdx : 0,
                    pathPos : 1,
                    returnValue : "ok",
                },
            }],
            creepsInfo : {
                0 : {
                    1 : ["creep2"],
                    2 : ["creep1"],
                },
            },
        }, {
            title : "swapping with a moving creeps swapping paths",
            creeps : [{
                creep : {
                    name : "creep1",
                    pathIdx : 0,
                    pathPos : 2,
                    targetPathPos : 2,
                },
                target : {
                    pathIdx : 2,
                    pathPos : 8,
                },
                result : {
                    pathIdx : 2,
                    pathPos : 8,
                    returnValue : "creepReachedTarget",
                },
            }, {
                creep : {
                    name : "creep2",
                    pathIdx : 2,
                    pathPos : 7,
                    targetPathPos : 7,
                },
                target : {
                    pathIdx : 0,
                    pathPos : 1,
                },
                result : {
                    pathIdx : 0,
                    pathPos : 1,
                    returnValue : "creepReachedTarget",
                },
            }],
            creepsInfo : {
                0 : {
                    1 : ["creep2"],
                },
                2 : {
                    8 : ["creep1"],
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

    describe("Moving creep away and towards the path", function() {
        let pathManager, move;

        before(function() {
            pathManager = new PathManager("test");
            move = sandbox.stub();
        });

        beforeEach(function() {
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
                    moveAway : 0,
                    targetPathPos : 1,
                },
                target : {
                    pathIdx : 0,
                    pathPos : 1,
                    moveAway : 2,
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
                    moveAway : 0,
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
                    moveAway : 0,
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
                    moveAway : 0,
                    targetPathPos : 1,
                },
                target : {
                    pathIdx : 0,
                    pathPos : 1,
                    moveAway : 2,
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
                    moveAway : 2,
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
                    moveAway : 6,
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
                    moveAway : 2,
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
                    moveAway : 6,
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
                    moveAway : 2,
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
                    moveAway : 2,
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

    after(function() {
        mockery.deregisterAll();
        mockery.disable();
        sandbox.restore();
        delete global.Memory;
    });
});
