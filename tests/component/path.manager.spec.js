let sinon = require("sinon");
let should = require("should");
let _ = require("lodash");
let sandbox = sinon.sandbox.create();
let mockery = require("mockery");

describe("PathManager", function() {
    let Memory = {}, PathManager;

    before(function() {
        global.Memory = Memory;
        mockery.enable();
        mockery.registerSubstitute("utils", process.cwd() + "/default/utils");
        mockery.registerSubstitute("base.class", process.cwd() + "/default/base.class");
        mockery.registerSubstitute("path.info", process.cwd() + "/default/path.info");
        PathManager = require("../../default/path.manager");
    });

    describe("Addition of paths", function() {
        let definePathPropertyInMemory;

        before(function() {
            definePathPropertyInMemory =
                sandbox.stub(utils, "definePathPropertyInMemory").callsFake(utils.definePropertyInMemory);
        });

        it("Adding 3 interconnected paths", function() {
            let pathManager = new PathManager("test0");

            pathManager.addPath([], {});
            pathManager.addPath([], {
                0 : {
                    fromPos : 5,
                    toPos : 4,
                },
            });
            pathManager.addPath([], {
                0 : {
                    fromPos : 2,
                    toPos : 7,
                },
                1 : {
                    fromPos : 1,
                    toPos : 3,
                },
            });

            (pathManager.connections).should.be.eql({
                0 : {
                    1 : {
                        idx : 1,
                        pos : 5,
                        targetPos : 4,
                    },
                    2 : {
                        idx : 2,
                        pos : 2,
                        targetPos : 7,
                    },
                },
                1 : {
                    0 : {
                        idx : 0,
                        pos : 4,
                        targetPos : 5,
                    },
                    2 : {
                        idx : 2,
                        pos : 1,
                        targetPos : 3,
                    },
                },
                2 : {
                    0 : {
                        idx : 0,
                        pos : 7,
                        targetPos : 2,
                    },
                    1 : {
                        idx : 1,
                        pos : 3,
                        targetPos : 1,
                    },
                },
            });
        });

        it("Adding paths with one connecting the other 2", function() {
            let pathManager = new PathManager("test1");
            pathManager.addPath([], {});
            pathManager.addPath([], {
                0 : {
                    fromPos : 5,
                    toPos : 4,
                },
            });
            pathManager.addPath([], {
                1 : {
                    fromPos : 1,
                    toPos : 3,
                },
            });

            (pathManager.connections).should.be.eql({
                0 : {
                    1 : {
                        idx : 1,
                        pos : 5,
                        targetPos : 4,
                    },
                    2 : {
                        idx : 1,
                        pos : 5,
                        targetPos : 4,
                    },
                },
                1 : {
                    0 : {
                        idx : 0,
                        pos : 4,
                        targetPos : 5,
                    },
                    2 : {
                        idx : 2,
                        pos : 1,
                        targetPos : 3,
                    },
                },
                2 : {
                    0 : {
                        idx : 1,
                        pos : 3,
                        targetPos : 1,
                    },
                    1 : {
                        idx : 1,
                        pos : 3,
                        targetPos : 1,
                    },
                },
            });
        });
    });

    after(function() {
        mockery.disable();
        delete global.Memory;
    });
});
