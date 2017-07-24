let sinon = require("sinon");
let should = require("should");
let _ = require("lodash");
let sandbox = sinon.sandbox.create();
let globals = require("../mocks/globals");
let testUtils = require("../test-utils");

describe("math", function() {
    let math;
    before(function() {
        globals.init(sandbox);
        math = require("../../default/math")
    });

    describe("rotateDirection", function() {
        it("Clockwise", function() {
            (math.rotateDirection(1, 1)).should.be.equal(2);
            (math.rotateDirection(1, 2)).should.be.equal(3);
            (math.rotateDirection(6, 3)).should.be.equal(1);
        });

        it("Anticlockwise", function() {
            (math.rotateDirection(2, -1)).should.be.equal(1);
            (math.rotateDirection(3, -2)).should.be.equal(1);
            (math.rotateDirection(2, -3)).should.be.equal(7);
        });
    });

    describe("getParallelPaths", function() {
        it("Diagonal path", function() {
            let path = testUtils.deserializePath("0505222444666444");
            let [path0, path1] = math.getParallelPaths(path);
            (math.getPathFromPoints(path0)).should.be.eql(testUtils.deserializePath("0504122444466644"));
            (math.getPathFromPoints(path1)).should.be.eql(testUtils.deserializePath("06051244666444"));
        });

        it("LatLong path", function() {
            let path = testUtils.deserializePath("0505111333555333");
            let [path0, path1] = math.getParallelPaths(path);
            (math.getPathFromPoints(path0)).should.be.eql(testUtils.deserializePath("040511123334553"));
            (math.getPathFromPoints(path1)).should.be.eql(testUtils.deserializePath("060511355433"));
        });

        it("Mixed path", function() {
            let path = testUtils.deserializePath("0310111122224444555577776666");
            let [path0, path1] = math.getParallelPaths(path);
            (math.getPathFromPoints(path0)).should.be.eql(testUtils.deserializePath("021011112222244444555567777666"));
            (math.getPathFromPoints(path1)).should.be.eql(testUtils.deserializePath("041011112224445557776666"));
        });
    });

    after(function() {
        sandbox.reset();
    });
});
