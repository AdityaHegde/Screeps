let sinon = require("sinon");
let should = require("should");
let utils = require("../../default/utils");
let _ = require("lodash");
let sandbox = sinon.sandbox.create();

describe("utils", function() {
    let MemoryBackup;

    before(function() {
        MemoryBackup = global.Memory;
        global._ = _;
    });

    it("definePropertyInMemory", function() {
        let A = function() {};
        A.prototype.memory = {};

        utils.definePropertyInMemory(A, "a", function() {
            return "default";
        });

        let a = new A();

        (a.a).should.be.equal("default");
        (a._a).should.be.equal("default");
        (a.memory.a).should.be.equal("default");
        a.a = "assigned";
        (a.a).should.be.equal("assigned");
        (a._a).should.be.equal("assigned");
        (a.memory.a).should.be.equal("assigned");
    });

    describe("defineInstancePropertyInMemory", function() {
        let A = function() {}, B = sandbox.spy(function(id) {
            if (id) {
                this.id = id;
            }
            else {
                this.id = "id";
            }
        }), a;
        A.prototype.memory = {};

        before(function() {
            utils.defineInstancePropertyInMemory(A, "a", B);
            a = new A();
        });

        beforeEach(function() {
            sandbox.reset();
        });

        it("not assigned", function() {
            (a.a).should.be.instanceof(B);
            (a.a.id).should.be.equal("id");
            (a._a).should.be.instanceof(B);
            (a.memory.a).should.be.equal("id");
            sinon.assert.calledOnce(B);
            sinon.assert.calledWith(B);
        });

        it("Assigned with id", function() {
            a.a = new B("id1");
            (a.a).should.be.instanceof(B);
            (a.a.id).should.be.equal("id1");
            (a._a).should.be.instanceof(B);
            (a.memory.a).should.be.equal("id1");
            sinon.assert.calledOnce(B);
            sinon.assert.calledWith(B, "id1");
        });

        it("Memory has id", function() {
            delete a._a;
            a.memory.a = "id2";
            (a.a).should.be.instanceof(B);
            (a.a.id).should.be.equal("id2");
            (a._a).should.be.instanceof(B);
            (a.memory.a).should.be.equal("id2");
            sinon.assert.calledOnce(B);
            sinon.assert.calledWith(B, "id2");
        });
    });

    describe("defineMapPropertyInMemory", function() {
        let A = function() {}, Memory = {
            "b" : {},
        }, a,
        classesMap = {
            "c" : sandbox.spy(function(id) { this.id = id || "idc"; }),
            "d" : sandbox.spy(function(id) { this.id = id || "idd"; }),
            "e" : sandbox.spy(function(id) { this.id = id || "ide"; }),
        };
        A.prototype.memory = {};

        before(function() {
            utils.defineMapPropertyInMemory(A, "a", "b", classesMap);
            global.Memory = Memory;
            a = new A();
        })

        beforeEach(function() {
            sandbox.reset();
        });

        it("nothing in Memory", function() {
            a.a.addKey("c");
            should(a.a.c).be.undefined();
            should(a.memory.a.c).be.undefined();
            sinon.assert.notCalled(classesMap.c);
        });

        it("instance is passed", function() {
            a.a.addKey("d", new classesMap.d("_idd"));
            (a.a.d).should.be.instanceof(classesMap.d);
            (a.memory.a.d).should.be.equal("_idd");
            sinon.assert.calledOnce(classesMap.d);
            sinon.assert.calledWith(classesMap.d, "_idd");
        });

        it("from Memory", function() {
            a.memory.a.e = "_ide";
            a.a.addKey("e");
            (a.a.e).should.be.instanceof(classesMap.e);
            (a._a.e).should.be.instanceof(classesMap.e);
            (a.memory.a.e).should.be.equal("_ide");
            sinon.assert.calledOnce(classesMap.e);
            sinon.assert.calledWith(classesMap.e, "_ide");
        });
    });

    after(function() {
        global.Memory = MemoryBackup;
    })
});
