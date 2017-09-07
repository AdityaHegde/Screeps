let sinon = require("sinon");
let should = require("should");
let sandbox = sinon.sandbox.create();
let testUtils = require("../test-utils");
let Heap = require("../../default/heap");

describe("heap", function () {
    it("heap.add and heap.remove", function () {
        let heap = new Heap();
        heap.add(1);
        heap.add(4);
        heap.add(3);
        heap.add(9);
        heap.add(6);

        (heap.array).should.be.eql([9, 6, 3, 1, 4]);

        (heap.remove()).should.be.equal(9);
        (heap.array).should.be.eql([6, 4, 3, 1]);

        (heap.remove()).should.be.equal(6);
        (heap.array).should.be.eql([4, 1, 3]);

        (heap.remove()).should.be.equal(4);
        (heap.array).should.be.eql([3, 1]);

        (heap.remove()).should.be.equal(3);
        (heap.array).should.be.eql([1]);

        (heap.remove()).should.be.equal(1);
        (heap.array).should.be.eql([]);

        should(heap.remove()).be.equal(undefined);
        (heap.array).should.be.eql([]);
    });

    it("heap.delete", function() {
        let heap = new Heap([9, 6, 3, 1, 4]);

        heap.delete(6);
        (heap.array).should.be.eql([9, 4, 3, 1]);

        heap.delete(1);
        (heap.array).should.be.eql([9, 4, 3]);

        heap.delete(9);
        (heap.array).should.be.eql([4, 3]);

        heap.delete(5);
        (heap.array).should.be.eql([4, 3]);

        heap.delete(4);
        (heap.array).should.be.eql([3]);

        heap.delete(3);
        (heap.array).should.be.eql([]);
    });

    it("heap.update", function() {
        let arr = [{
            v : 9,
        }, {
            v : 6,
        }, {
            v : 3,
        }, {
            v : 1,
        }, {
            v : 4,
        }]
        let heap = new Heap(arr.slice(), function(a, b) {
            return a.v - b.v;
        });

        arr[2].v = 7;
        heap.update(arr[2]);
        (heap.array.map(e => e.v)).should.be.eql([9, 6, 7, 1, 4]);

        arr[0].v = 2;
        heap.update(arr[0]);
        (heap.array.map(e => e.v)).should.be.eql([7, 6, 2, 1, 4]);

        arr[4].v = 8;
        heap.update(arr[4]);
        (heap.array.map(e => e.v)).should.be.eql([8, 7, 2, 1, 6]);
    });
});
