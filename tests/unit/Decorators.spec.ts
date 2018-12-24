const sinon = require("sinon");
const should = require("should");
const _ = require("lodash");
const globals = require("../mocks/globals");
const sandbox = sinon.sandbox.create();
const testUtils = require("../test-utils");
const Decorators = require("../../src/Decorators");

describe("Decorators", function () {
  before(function () {
    globals.init(sandbox);
  });

  describe("memory, alias, inCache, inMemory and instanceInMemory", function () {
    let inCachePropGetter;
    let inMemoryPropGetter;
    let inMemoryPropSerializer;
    let inMemoryPropDeserializer;
    let MemoryTest;
    let InstanceByIdTest;
    let InstanceByNameTest;
    let finalMemoryData = {
      memoryTests: {
        testId_value: {
          inMemoryProp: "new_memory_value",
          instanceByIdProp: "instanceId_id"
        }
      },
      instanceByIdTests: {
        instanceId_id: {
          inMemoryProp: "instanceId_id_memoryProp_value"
        }
      }
    };

    before(function () {
      globals.resetMemory();

      inCachePropGetter = sandbox.stub().returns("inCacheProp_value");
      inMemoryPropGetter = sandbox.stub().returns("inMemoryProp_getter_value");
      inMemoryPropSerializer = sandbox.stub().returnsArg(0);
      inMemoryPropDeserializer = sandbox.stub().returnsArg(0);

      @Decorators.memory("instanceByIdTest", "instanceByIdTests")
      class _InstanceByIdTest {
        constructor(id = "no_id") {
          this.id = id;
        }

        @Decorators.inMemory()
        inMemoryProp;
      }
      InstanceByIdTest = _InstanceByIdTest;

      @Decorators.memory("memoryTest", "memoryTests", "testId")
      class _MemoryTest {
        constructor(testId) {
          this.testId = testId;
        }

        aliasTargetProp = "aliasTargetProp_value_init"

        @Decorators.alias("aliasTargetProp")
        aliasProp;

        @Decorators.inCache(inCachePropGetter)
        inCacheProp;

        @Decorators.inMemory(
          inMemoryPropGetter,
          inMemoryPropSerializer,
          inMemoryPropDeserializer
        )
        inMemoryProp;

        @Decorators.instanceInMemory(InstanceByIdTest)
        instanceByIdProp;
      }
      MemoryTest = _MemoryTest;
    });

    it("Instaniation", function () {
      let memoryTest = new MemoryTest("testId_value");
      (memoryTest.aliasProp).should.be.equal("aliasTargetProp_value_init");
      (memoryTest.inCacheProp).should.be.equal("inCacheProp_value");
      sinon.assert.calledOnce(inCachePropGetter);
      (memoryTest.inMemoryProp).should.be.equal("inMemoryProp_getter_value");
      sinon.assert.calledOnce(inMemoryPropGetter);
      sinon.assert.calledOnce(inMemoryPropSerializer);
      sinon.assert.notCalled(inMemoryPropDeserializer);
      (memoryTest.instanceByIdProp).should.be.instanceof(InstanceByIdTest);

      (Memory).should.be.eql({
        memoryTests: {
          testId_value: {
            inMemoryProp: "inMemoryProp_getter_value",
            instanceByIdProp: "no_id"
          }
        }
      });
    });

    it("Save to memory", function () {
      let memoryTest = new MemoryTest("testId_value");

      memoryTest.aliasProp = "new_alias_value";
      memoryTest.inCacheProp = "new_cache_value";
      memoryTest.inMemoryProp = "new_memory_value";
      memoryTest.instanceByIdProp = new InstanceByIdTest("instanceId_id");
      memoryTest.instanceByIdProp.inMemoryProp = "instanceId_id_memoryProp_value";

      (memoryTest.aliasTargetProp).should.be.equal("new_alias_value");
      (memoryTest.aliasProp).should.be.equal("new_alias_value");
      (memoryTest.inCacheProp).should.be.equal("new_cache_value");
      (memoryTest.inMemoryProp).should.be.equal("new_memory_value");
      (memoryTest.instanceByIdProp).should.be.instanceof(InstanceByIdTest);

      (Memory).should.be.eql(finalMemoryData);
    });

    it("Load from memory", function () {
      let memoryTest = new MemoryTest("testId_value");

      (memoryTest.aliasTargetProp).should.be.equal("aliasTargetProp_value_init");
      (memoryTest.aliasProp).should.be.equal("aliasTargetProp_value_init");
      (memoryTest.inCacheProp).should.be.equal("inCacheProp_value");
      (memoryTest.inMemoryProp).should.be.equal("new_memory_value");

      (memoryTest.instanceByIdProp).should.be.instanceof(InstanceByIdTest);
      (memoryTest.instanceByIdProp.inMemoryProp).should.be.equal("instanceId_id_memoryProp_value");

      (Memory).should.be.eql(finalMemoryData);
    });

    afterEach(function () {
      sandbox.resetHistory();
    });
  });

  describe("mapInMemory and instanceMapInMemory", function () {
    let mapInMemoryPropSerializer;
    let mapInMemoryPropDeserializer;
    let MemoryTest;
    let InstanceMapTest1, InstanceMapTest2, InstanceMapTest3;
    let instanceMap;
    let finalMemoryData = {
      memoryTests: {
        testId_value: {
          mapInMemoryProp: {
            mk0: "v0",
            mk1: "v1",
            mk2: "v2"
          },
          instanceMapInMemoryProp: {
            k0: "t_0_0",
            k1: "t_0_1",
            k2: "t_0_2"
          },
          instancePolymorphMapInMemoryProp: {
            in0: "t_1_0",
            in1: "t_1_1",
            in2: "t_1_2"
          }
        }
      },
      instanceMapTests1: {
        t_0_0: {
          inMemoryProp: "imk0"
        },
        t_0_1: {
          inMemoryProp: "imk1"
        },
        t_0_2: {
          inMemoryProp: "imk2"
        },
        t_1_0: {
          inMemoryProp: "imin0"
        }
      },
      instanceMapTests2: {
        t_1_1: {
          inMemoryProp: "imin1"
        }
      },
      instanceMapTests3: {
        t_1_2: {
          inMemoryProp: "imin2"
        }
      }
    };

    before(function () {
      globals.resetMemory();

      mapInMemoryPropSerializer = sandbox.stub().returnsArg(0);
      mapInMemoryPropDeserializer = sandbox.stub().returnsArg(1);

      @Decorators.memory("instanceMapTest1", "instanceMapTests1")
      class _InstanceMapTest1 {
        constructor(id = "no_id") {
          this.id = id;
        }

        @Decorators.inMemory()
        inMemoryProp;
      }
      InstanceMapTest1 = _InstanceMapTest1;

      @Decorators.memory("instanceMapTest2", "instanceMapTests2")
      class _InstanceMapTest2 {
        constructor(id = "no_id") {
          this.id = id;
        }

        @Decorators.inMemory()
        inMemoryProp;
      }
      InstanceMapTest2 = _InstanceMapTest2;

      @Decorators.memory("instanceMapTest3", "instanceMapTests3")
      class _InstanceMapTest3 {
        constructor(id = "no_id") {
          this.id = id;
        }

        @Decorators.inMemory()
        inMemoryProp;
      }
      InstanceMapTest3 = _InstanceMapTest3;

      instanceMap = {
        "in0": InstanceMapTest1,
        "in1": InstanceMapTest2,
        "in2": InstanceMapTest3
      };

      @Decorators.memory("memoryTest", "memoryTests")
      class _MemoryTest {
        constructor(id) {
          this.id = id;
        }

        @Decorators.mapInMemory(
          mapInMemoryPropSerializer,
          mapInMemoryPropDeserializer
        )
        mapInMemoryProp;

        @Decorators.instanceMapInMemory(InstanceMapTest1)
        instanceMapInMemoryProp;

        @Decorators.instancePolymorphMapInMemory(instanceMap)
        instancePolymorphMapInMemoryProp;
      }
      MemoryTest = _MemoryTest;
    });

    it("Instaniation", function () {
      let memoryTest = new MemoryTest("testId_value");
      (memoryTest.mapInMemoryProp).should.be.eql({});
      sinon.assert.notCalled(mapInMemoryPropSerializer);
      sinon.assert.notCalled(mapInMemoryPropDeserializer);
      (memoryTest.instanceMapInMemoryProp).should.be.eql({});
      (memoryTest.instancePolymorphMapInMemoryProp).should.be.eql({});

      (Memory).should.be.eql({
        memoryTests: {
          testId_value: {
            mapInMemoryProp: {},
            instanceMapInMemoryProp: {},
            instancePolymorphMapInMemoryProp: {}
          }
        }
      });
    });

    it("Save to memory", function () {
      let memoryTest = new MemoryTest("testId_value");

      for (let i = 0; i < 3; i++) {
        memoryTest.mapInMemoryProp.addKey("mk" + i, "v" + i);
      }

      let instances1 = [new InstanceMapTest1("t_0_0"), new InstanceMapTest1("t_0_1"), new InstanceMapTest1("t_0_2")];
      let instances2 = [new InstanceMapTest1("t_1_0"), new InstanceMapTest2("t_1_1"), new InstanceMapTest3("t_1_2")];

      instances1.forEach((instance1, i) => {
        instance1.inMemoryProp = "imk" + i;
        memoryTest.instanceMapInMemoryProp.addKey("k" + i, instance1);
      });
      instances2.forEach((instance2, i) => {
        instance2.inMemoryProp = "imin" + i;
        memoryTest.instancePolymorphMapInMemoryProp.addKey("in" + i, instance2);
      });

      (memoryTest.mapInMemoryProp).should.be.eql({
        mk0: "v0",
        mk1: "v1",
        mk2: "v2"
      });
      sinon.assert.calledThrice(mapInMemoryPropSerializer);
      sinon.assert.notCalled(mapInMemoryPropDeserializer);
      (memoryTest.instanceMapInMemoryProp).should.be.eql({
        k0: instances1[0],
        k1: instances1[1],
        k2: instances1[2]
      });
      (memoryTest.instancePolymorphMapInMemoryProp).should.be.eql({
        in0: instances2[0],
        in1: instances2[1],
        in2: instances2[2]
      });

      (Memory).should.be.eql(finalMemoryData);
    });

    it("Load from memory", function () {
      let memoryTest = new MemoryTest("testId_value");

      (memoryTest.mapInMemoryProp).should.be.eql({
        mk0: "v0",
        mk1: "v1",
        mk2: "v2"
      });
      sinon.assert.calledThrice(mapInMemoryPropSerializer);
      sinon.assert.calledThrice(mapInMemoryPropDeserializer);
      sinon.assert.match(memoryTest.instanceMapInMemoryProp, {
        k0: sinon.match.instanceOf(InstanceMapTest1),
        k1: sinon.match.instanceOf(InstanceMapTest1),
        k2: sinon.match.instanceOf(InstanceMapTest1)
      });
      sinon.assert.match(memoryTest.instancePolymorphMapInMemoryProp, {
        in0: sinon.match.instanceOf(InstanceMapTest1),
        in1: sinon.match.instanceOf(InstanceMapTest2),
        in2: sinon.match.instanceOf(InstanceMapTest3)
      });

      (Memory).should.be.eql(finalMemoryData);
    });

    afterEach(function () {
      sandbox.resetHistory();
    });
  });

  after(function () {
    sandbox.restore();
    delete global.Memory;
  });
});
