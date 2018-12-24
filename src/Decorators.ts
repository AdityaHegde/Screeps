import Heap from "./Heap";
import MemoryMap from "./MemoryMap";
import * as _ from "lodash";

class Decorators {
  /**
   * Adds memory support to the class.
   *
   * @method memory
   * @param idProperty {String}
   */
  static memory(idProperty: string = "id"): any {
    return function(classObject) {
      let classMatch = classObject.toString().match(/class (\w*)/);
      let functionMatch = classObject.toString().match(/\[Function: (.*)\]/);
      let className: string = (classMatch && classMatch[1]) || (functionMatch && functionMatch[1]);
      let memoryName = className;
      classObject.className = className.toLowerCase();
      classObject.memoryName = className;
      classObject.idProperty = idProperty;
      Object.defineProperty(classObject.prototype, "memory", {
        get: function () {
          if (!Memory[memoryName]) {
            Memory[memoryName] = {};
          }
          Memory[memoryName][this[idProperty]] = Memory[memoryName][this[idProperty]] || {};
          return Memory[memoryName][this[idProperty]];
        },
        set: function (value) {
          if (!Memory[memoryName]) {
            Memory[memoryName] = {};
          }
          Memory[memoryName][this[idProperty]] = value;
        },
        enumerable: true,
        configurable: true
      });
    };
  }

  /**
   * Defines an alias to another property.
   *
   * @method alias
   * @param targetProperty {String}
   */
  static alias(targetProperty: string): any {
    return function(classPrototype: Object, fieldName: string, descriptor: any) {
      descriptor = descriptor || {};
      descriptor.get = function () {
        return _.get(this, targetProperty);
      };
      descriptor.set = function (value: any) {
        _.set(this, targetProperty, value);
      };
      return descriptor;
    };
  }

  /**
   * Defines a property which gets cached and returns from cache.
   *
   * @method inCache
   * @param getter {Function} Function that returns the initial value for 'property'.
   */
  static inCache(getter: Function): any {
    return function(classPrototype: Object, fieldName: string, descriptor: any) {
      descriptor = descriptor || {};
      let _fieldName = "_" + fieldName;
      descriptor.get = function () {
        // if the property is not defined in cache yet, get it from memory
        if (!_.has(this, _fieldName)) {
          this[_fieldName] = getter.call(this, ...arguments);
        }
        // return from cache
        return this[_fieldName];
      };
      descriptor.set = function (value: any) {
        // save the value to the cache
        this[_fieldName] = value;
      };
      return descriptor;
    };
  }

  /**
   * Defines a property which gets mirrored in memory. Prototype should have a property 'memory'
   *
   * @method inMemory
   * @param [getter] {Function} Function that returns the initial value for 'property'. Defaults value to null.
   * @param [serializer] {Function} Function to serialize value to be stored in memory. Defaults to storing value as is.
   * @param [deserializer] {Function} Function to deserialize value retrieved from memory. Defaults to returning value as is.
   */
  static inMemory(
    getter = function () { return null; },
    serializer = function (value: any) { return value; },
    deserializer = function (value: any) { return value; }
  ): any {
    return function(classPrototype: Object, fieldName: string, descriptor: any) {
      descriptor = descriptor || {};
      let _fieldName = "_" + fieldName;
      descriptor.get = function () {
        // if the property is not defined in cache yet, get it from memory
        if (!_.has(this, _fieldName)) {
          // if the property is not present in the memory either, use the getter function passed to get the value and store in memory
          if (!_.has(this.memory, fieldName)) {
            this[_fieldName] = getter.call(this, ...arguments);
            this.memory[fieldName] = this[_fieldName] && serializer.call(this, this[_fieldName]);
          } else {
            this[_fieldName] = deserializer.call(this, this.memory[fieldName]);
          }
        }
        // return from cache
        return this[_fieldName];
      };
      descriptor.set = function (value: any) {
        // save the serialized value to memory and value to cache
        if (value !== null && value !== undefined) {
          this.memory[fieldName] = serializer.call(this, value);
        }
        this[_fieldName] = value;
      };

      return descriptor;
    };
  }

  /**
   * Defines a property which references an instance. Instance is stored by 'id' in memory.
   * Prototype should have a property 'memory'.
   *
   * @method instanceInMemory
   * @param [ClassObject] {Class} Class for the instance. If not specified, Game.getObjectById is used.
   * @param [getter] {Function} Function that returns the initial value for 'property'. Defaults value to empty instance of ClassObject.
   */
  static instanceInMemory(ClassObject, getter: Function = null): any {
    return this.inMemory(() => {
      return getter ? getter.call(this) : (ClassObject && new ClassObject());
    }, (instance) => {
      return instance && instance.id;
    }, (instanceId) => {
      if (instanceId) {
        let instance;
        if (ClassObject) {
          instance = new ClassObject(instanceId);
        } else {
          instance = Game.getObjectById(instanceId);
        }
        // instance[this.constructor.className] = this;
        return instance;
      }
    });
  }

  /**
   * Defines a property which references an instance. Instance is stored by 'name' in memory.
   * Prototype should have a property 'memory'.
   *
   * @method instanceInMemoryByName
   * @param memoryName {String} memoryName for the class of instance on Game.
   */
  static instanceInMemoryByName(memoryName): any {
    return this.inMemory(null, (instance) => {
      return instance.name;
    }, (instanceName) => {
      let instance = Game[memoryName][instanceName];
      // instance[this.constructor.className] = this;
      return instance;
    });
  }

  /**
   * Defines position property which is stored in memory as "x:y".
   *
   * @method posInMemory
   */
  static posInMemory(): any {
    return this.inMemory(null, function (pos) {
      return pos.x + ":" + pos.y;
    }, function (pos) {
      if (pos && this.room) {
        let xy = pos.split(":");
        return new RoomPosition(Number(xy[0]), Number(xy[1]), this.room.name);
      }
      return null;
    });
  }

  /**
   * Defines path property which is stored in memory using Room.serializePath.
   * And retrieved from memory using Room.deserializePath.
   *
   * @method pathInMemory
   */
  static pathInMemory(): any {
    return this.inMemory(null, (value) => {
      return Room.serializePath(value);
    }, (value) => {
      return Room.deserializePath(value);
    });
  }

  /**
   * Defines CostMatrix property which is stored in memory using costMatrix.serialize.
   * And retrieved from memory using PathFinder.CostMatrix.deserialize.
   *
   * @method costMatrixInMemory
   */
  static costMatrixInMemory(): any {
    return this.inMemory(null, (costMatrix) => {
      return costMatrix.serialize();
    }, (costMatrix) => {
      return PathFinder.CostMatrix.deserialize(costMatrix);
    });
  }

  /**
   * Defines Heap property which is stored in memory as array.
   * And retrieved from memory by creating a new Heap instance.
   *
   * @method heapInMemory
   */
  static heapInMemory(): any {
    return this.inMemory(function() {
      return new Heap();
    }, (heap) => {
      return heap.array;
    }, (array) => {
      return new Heap(array);
    });
  }

  /**
   * Defines a property which acts as a map. Stored serialized but used deserialized.
   *
   * @method mapInMemory
   * @param [serializer] {Function} Function to serialize value to be stored in memory. Defaults to storing value as is.
   * @param [deserializer] {Function} Function to deserialize value retrieved from memory. Defaults to returning value as is.
   */
  static mapInMemory(
    serializer = function (value) { return value; },
    deserializer = function (key, value) { return value; }
  ): any {
    return function(classPrototype, fieldName, descriptor) {
      let _fieldName = "_" + fieldName;
      descriptor = descriptor || {};
      descriptor.get = function () {
        // if map is not cached, assign _mapValue and get the instance for any stored ids in memory
        if (!_.has(this, _fieldName)) {
          // if map is not in memory, assign mapValue to memory
          if (!_.has(this.memory, fieldName)) {
            this.memory[fieldName] = {};
          }
          this[_fieldName] =  new MemoryMap(this.memory[fieldName], serializer, deserializer);
        }
        return this[_fieldName];
      };

      return descriptor;
    };
  }

  /**
   * Defines a property which references a map of instances in memory by id.
   *
   * @method instanceMapInMemory
   * @param ClassObject {Class} Class for instance.
   */
  static instanceMapInMemory(ClassObject): any {
    return this.mapInMemory(function (value) {
      return value && value[ClassObject.idProperty];
    }, function (key, value) {
      let instance = new ClassObject(value);
      // instance[this.constructor.className] = this;
      return instance;
    });
  }

  /**
   * Defines a property which references a map of instances in memory by name.
   *
   * @method instanceMapInMemoryByName
   * @param memoryName {String}
   */
  static instanceMapInMemoryByName(memoryName): any {
    return this.mapInMemory(function (value) {
      return value && value.name;
    }, function (key, value) {
      let instance = Game[memoryName][value];
      // instance[this.constructor.className] = this;
      return instance;
    });
  }

  /**
   * Defines a property which references has a map of instances in memory.
   *
   * @method instancePolymorphMapInMemory
   * @param polymorphMap {Object} Map of class to use.
   */
  static instancePolymorphMapInMemory(polymorphMap): any {
    return this.mapInMemory(function (value) {
      return value && value.id;
    }, function (key, value) {
      let instance = new polymorphMap[key](value);
      // instance[this.constructor.className] = this;
      return instance;
    });
  }

  /**
   * Defines map of path.
   *
   * @method pathMapInMemory
   */
  static pathMapInMemory(): any {
    return this.mapInMemory((value) => {
      return Room.serializePath(value);
    }, (key, value) => {
      return Room.deserializePath(value);
    });
  }
}

export default Decorators;
