import "mocha";

import * as sinon from "sinon";
import * as should from "should";

import testUtils from "test/testUtils";
import Decorators from "src/Decorators";
import BaseClass from "src/BaseClass";
import MemoryMap from "src/MemoryMap";
import MemorySet from "src/MemorySet";

let sandbox = sinon.createSandbox();

@Decorators.memory("memoryTestInstance")
class MemoryTestIntance extends BaseClass {
  @Decorators.inMemory()
  value: string;

  constructor(id: string) {
    super(id);
  }

  setValue(value: string) {
    this.value = value;
    return this;
  }
}

describe("Decorators", () => {
  beforeEach(() => {
    global["Memory"] = {};
  });

  describe("memory, alias, inCache, inMemory", () => {
    it("Class without custom id property, direct inMemory", () => {
      let cachedGetter = sandbox.stub().returns("c");
      let memoryGetter = sandbox.stub().returns("m");

      @Decorators.memory("memoryTest")
      class MemoryTest {
        id: string;

        @Decorators.alias("id")
        aliased: string;

        @Decorators.inCache(cachedGetter)
        cahced: string;

        @Decorators.inMemory(memoryGetter)
        memoryStr: string;

        constructor(id: string) {
          this.id = id;
        }
      }

      let ma = new MemoryTest("ia");
      should(ma.aliased).be.equal("ia");
      ma.cahced;
      should(ma.cahced).be.equal("c");
      ma.memoryStr = "mas";

      let mb = new MemoryTest("ib");
      should(mb.aliased).be.equal("ib");
      mb.cahced;
      should(mb.cahced).be.equal("c");
      mb.memoryStr = "mbs";

      let mc = new MemoryTest("ic");
      should(mc.aliased).be.equal("ic");
      mc.cahced;
      should(mc.cahced).be.equal("c");
      mc.memoryStr = "mcs";

      should(ma.memoryStr).be.equal("mas");
      should(ma["_memoryStr"]).be.equal("mas");
      should(mb.memoryStr).be.equal("mbs");
      should(mb["_memoryStr"]).be.equal("mbs");
      should(mc.memoryStr).be.equal("mcs");
      should(mc["_memoryStr"]).be.equal("mcs");
      
      should(global["Memory"]).be.eql({
        memoryTest: {
          ia: {
            memoryStr: "mas",
          },
          ib: {
            memoryStr: "mbs",
          },
          ic: {
            memoryStr: "mcs",
          },
        },
      });
      
      sinon.assert.calledThrice(cachedGetter);
    });

    it("Class with custom id property, serialized inMemory", () => {
      let memoryGetter = sandbox.stub().returns({id: "ina"});

      @Decorators.memory("memoryTest", "idx")
      class MemoryTest {
        idx: string;

        @Decorators.inMemory(
          memoryGetter,
          (value) => {return value.id},
          (id) => {return {id}},
        )
        memoryStr: any;

        constructor(idx: string) {
          this.idx = idx;
        }
      }

      let ma = new MemoryTest("ma");
      should(ma.memoryStr).be.eql({id: "ina"});
      should(ma["_memoryStr"]).be.eql({id: "ina"});
      should(global["Memory"]).be.eql({
        memoryTest: {
          ma: {
            memoryStr: "ina",
          },
        },
      });

      ma.memoryStr = {id: "inb"};
      should(ma.memoryStr).be.eql({id: "inb"});
      should(ma["_memoryStr"]).be.eql({id: "inb"});
      should(global["Memory"]).be.eql({
        memoryTest: {
          ma: {
            memoryStr: "inb",
          },
        },
      });
    });
  });

  describe("instanceInMemory", () => {
    it("With 'ClassObject'", () => {
      @Decorators.memory("memoryTest")
      class MemoryTest extends BaseClass {
        @Decorators.instanceInMemory(MemoryTestIntance)
        instance: MemoryTestIntance;

        @Decorators.instanceInMemory(MemoryTestIntance, () => {
          return new MemoryTestIntance("getter").setValue("getterv");
        })
        instanceWithGetter: MemoryTestIntance;
      }

      let ma = new MemoryTest("ma");
      should(ma.instance).be.instanceof(MemoryTestIntance);
      should(ma.instance.id).be.equal("1");
      ma.instance = new MemoryTestIntance("mti").setValue("mtv");
      should(ma.instance).be.instanceof(MemoryTestIntance);
      should(ma.instance.id).be.equal("mti");
      should(ma.instance.value).be.equal("mtv");

      should(ma.instanceWithGetter).be.instanceof(MemoryTestIntance);
      should(ma.instanceWithGetter.id).be.equal("getter");
      should(ma.instanceWithGetter.value).be.equal("getterv");
      ma.instanceWithGetter = new MemoryTestIntance("mtgi").setValue("mtgv");
      should(ma.instanceWithGetter).be.instanceof(MemoryTestIntance);
      should(ma.instanceWithGetter.id).be.equal("mtgi");
      should(ma.instanceWithGetter.value).be.equal("mtgv");

      let _ma = new MemoryTest("ma");
      should(_ma.instance).be.instanceof(MemoryTestIntance);
      should(_ma.instance.id).be.equal("mti");
      should(_ma.instance.value).be.equal("mtv");
      should(_ma.instanceWithGetter).be.instanceof(MemoryTestIntance);
      should(_ma.instanceWithGetter.id).be.equal("mtgi");
      should(_ma.instanceWithGetter.value).be.equal("mtgv");

      should(global["Memory"]).be.eql({
        ids: {
          memoryTestInstance: 1,
        },
        memoryTest: {
          ma: {
            instance: "mti",
            instanceWithGetter: "mtgi",
          },
        },
        memoryTestInstance: {
          getter: {
            value: "getterv",
          },
          mtgi: {
            value: "mtgv",
          },
          mti: {
            value: "mtv",
          },
        },
      });
    });
  });

  describe("instanceSetInMemory", () => {
    it("with 'ClassObject'", () => {
      @Decorators.memory("memoryTest")
      class MemoryTest extends BaseClass {
        @Decorators.instanceSetInMemory(MemoryTestIntance)
        instanceSet: MemorySet<MemoryTestIntance>;
      }

      let ma = new MemoryTest("ma");
      let mti = new MemoryTestIntance("id1").setValue("v1");
      ma.instanceSet.add(new MemoryTestIntance("id0").setValue("v0"));
      ma.instanceSet.add(mti);
      ma.instanceSet.add(new MemoryTestIntance("id2").setValue("v2"));

      ma.instanceSet.delete(mti);
      should(new Array(...ma.instanceSet).map((instance) => {
        return instance.value;
      })).be.eql([
        "v0", "v2",
      ]);

      ma.instanceSet.replace([
        new MemoryTestIntance("id3").setValue("v3"),
        new MemoryTestIntance("id4").setValue("v4")
      ]);
      should(new Array(...ma.instanceSet).map((instance) => {
        return instance.value;
      })).be.eql([
        "v3", "v4",
      ]);

      let _ma = new MemoryTest("ma");
      should(new Array(..._ma.instanceSet).map((instance) => {
        return instance.value;
      })).be.eql([
        "v3", "v4",
      ]);

      should(global["Memory"]).be.eql({
        memoryTest: {
          ma: {
            instanceSet: ["id3", "id4"],
          },
        },
        memoryTestInstance: {
          id0: {
            value: "v0",
          },
          id1: {
            value: "v1",
          },
          id2: {
            value: "v2",
          },
          id3: {
            value: "v3",
          },
          id4: {
            value: "v4",
          },
        },
      });
    });
  });

  describe("instanceMapInMemory", () => {
    it("with 'ClassObject'", () => {
      @Decorators.memory("memoryTest")
      class MemoryTest extends BaseClass {
        @Decorators.instanceMapInMemory(MemoryTestIntance)
        instanceMap: MemoryMap<string, MemoryTestIntance>;
      }

      let ma = new MemoryTest("ma");
      ma.instanceMap.set("k0", new MemoryTestIntance("id0").setValue("v0"));
      ma.instanceMap.set("k1", new MemoryTestIntance("id1").setValue("v1"));
      ma.instanceMap.set("k2", new MemoryTestIntance("id2").setValue("v2"));

      let _ma = new MemoryTest("ma");
      should(_ma.instanceMap.get("k0").value).be.equal("v0");
      should(_ma.instanceMap.get("k1").value).be.equal("v1");
      should(_ma.instanceMap.get("k2").value).be.equal("v2");

      should(global["Memory"]).be.eql({
        memoryTest: {
          ma: {
            instanceMap: {
              k0: "id0",
              k1: "id1",
              k2: "id2",
            }
          },
        },
        memoryTestInstance: {
          id0: {
            value: "v0",
          },
          id1: {
            value: "v1",
          },
          id2: {
            value: "v2",
          },
        },
      });
    });
  });
});
