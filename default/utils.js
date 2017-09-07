/* globals _, Game, Memory, Room, RoomPosition, PathFinder */

let math = require("math");
let Heap = require("heap");

module.exports = {
    /**
     * Defines a alias to another property.
     *
     * @method defineAliasProperty
     * @param Class {Class} Class to define the 'property' on.
     * @param property {String}
     * @param targetProperty {String}
     */
    defineAliasProperty: function (Class, property, targetProperty) {
        Object.defineProperty(Class.prototype, property, {
            get: function () {
                return this[targetProperty];
            },
            set: function (value) {
                this[targetProperty] = value;
            },
            enumerable: true,
            configurable: true
        });
    },

    /**
     * Defines a property which get cached and returns from cache.
     *
     * @method definePropertyInCache
     * @param Class {Class} Class to define the 'property' on.
     * @param property {String}
     * @param getter {Function} Function that returns the initial value for 'property'.
     */
    definePropertyInCache: function (Class, property, getter) {
        let _property = "_" + property;
        Object.defineProperty(Class.prototype, property, {
            get: function () {
                // if the property is not defined in cache yet, get it from memory
                if (!_.has(this, _property)) {
                    this[_property] = getter.call(this, ...arguments);
                }
                // return from cache
                return this[_property];
            },
            set: function (value) {
                // save the value to the cache
                this[_property] = value;
            },
            enumerable: true,
            configurable: true
        });
    },

    /**
     * Defines a property which gets mirrored in memory. Prototype should have a property 'memory'
     *
     * @method definePropertyInMemory
     * @param Class {Class} Class to define the 'property' on.
     * @param property {String}
     * @param [getter] {Function} Function that returns the initial value for 'property'. Defaults value to null.
     * @param [serializer] {Function} Function to serialize value to be stored in memory. Defaults to storing value as is.
     * @param [deserializer] {Function} Function to deserialize value retrieved from memory. Defaults to returning value as is.
     */
    definePropertyInMemory: function (Class, property, getter, serializer, deserializer) {
        getter = getter || function () { return null; };
        serializer = serializer || function (value) { return value; };
        deserializer = deserializer || function (value) { return value; };
        let _property = "_" + property;
        Object.defineProperty(Class.prototype, property, {
            get: function () {
                // if the property is not defined in cache yet, get it from memory
                if (!_.has(this, _property)) {
                    // if the property is not present in the memory either, use the getter function passed to get the value and store in memory
                    if (!_.has(this.memory, property)) {
                        this[_property] = getter.call(this, ...arguments);
                        this.memory[property] = this[_property] && serializer.call(this, this[_property]);
                    } else {
                        this[_property] = deserializer.call(this, this.memory[property]);
                    }
                }
                // return from cache
                return this[_property];
            },
            set: function (value) {
                // save the serialized value to memory and value to cache
                if (value !== null && value !== undefined) {
                    this.memory[property] = serializer.call(this, value);
                }
                this[_property] = value;
            },
            enumerable: true,
            configurable: true
        });
    },

    /**
     * Defines a property which references an instance. Instance is stored by 'id' in memory.
     * Prototype should have a property 'memory'.
     *
     * @method defineInstancePropertyInMemory
     * @param Class {Class} Class to define the 'property' on.
     * @param property {String}
     * @param [ClassObject] {Class} Class for the instance. If not specified, Game.getObjectById is used.
     * @param [getter] {Function} Function that returns the initial value for 'property'. Defaults value to empty instance of ClassObject.
     */
    defineInstancePropertyInMemory: function (Class, property, ClassObject, getter) {
        this.definePropertyInMemory(Class, property, () => {
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
                instance[this.constructor.className] = this;
                return instance;
            }
        });
    },

    /**
     * Defines a property which references an instance. Instance is stored by 'name' in memory.
     * Prototype should have a property 'memory'.
     *
     * @method defineInstancePropertyByNameInMemory
     * @param Class {Class} Class to define the 'property' on.
     * @param property {String}
     * @param memoryName {String} memoryName for the class of instance on Game.
     */
    defineInstancePropertyByNameInMemory: function (Class, property, memoryName) {
        this.definePropertyInMemory(Class, property, null, (instance) => {
            return instance.name;
        }, (instanceId) => {
            let instance = Game[memoryName][instanceId];
            instance[this.constructor.className] = this;
            return instance;
        });
    },

    /**
     * Defines position property which is stored in memory as "x:y".
     *
     * @method definePosPropertyInMemory
     * @param Class {Class} Class to define the 'property' on.
     * @param property {String}
     */
    definePosPropertyInMemory: function (Class, property) {
        this.definePropertyInMemory(Class, property, null, function (pos) {
            return pos.x + ":" + pos.y;
        }, function (pos) {
            if (pos && this.room) {
                let xy = pos.split(":");
                return new RoomPosition(Number(xy[0]), Number(xy[1]), this.room.name);
            }
            return null;
        });
    },

    /**
     * Defines path property which is stored in memory using Room.serializePath.
     * And retrieved from memory using Room.deserializePath.
     *
     * @method definePathPropertyInMemory
     * @param Class {Class} Class to define the 'property' on.
     * @param property {String}
     */
    definePathPropertyInMemory: function (Class, property) {
        this.definePropertyInMemory(Class, property, null, (value) => {
            return Room.serializePath(value);
        }, (value) => {
            return Room.deserializePath(value);
        });
    },

    /**
     * Defines CostMatrix property which is stored in memory using costMatrix.serialize.
     * And retrieved from memory using PathFinder.CostMatrix.deserialize.
     *
     * @method defineCostMatrixPropertyInMemory
     * @param Class {Class} Class to define the 'property' on.
     * @param property {String}
     */
    defineCostMatrixPropertyInMemory: function (Class, property) {
        this.definePropertyInMemory(Class, property, null, (costMatrix) => {
            return costMatrix.serialize();
        }, (costMatrix) => {
            return PathFinder.CostMatrix.deserialize(costMatrix);
        });
    },

    /**
     * Defines Heap property which is stored in memory as array.
     * And retrieved from memory by creating a new Heap instance.
     *
     * @method defineHeapPropertyInMemory
     * @param Class {Class} Class to define the 'property' on.
     * @param property {String}
     */
    defineHeapPropertyInMemory: function (Class, property) {
        this.definePropertyInMemory(Class, property, function() {
            return new Heap();
        }, (heap) => {
            return heap.array;
        }, (array) => {
            return new Heap(array);
        });
    },

    /**
     * Defines a property which acts as a map. Stored serialized but used deserialized.
     *
     * @method defineMapPropertyInMemory
     * @param Class {Class} Class to define the 'property' on.
     * @param property {String}
     * @param [serializer] {Function} Function to serialize value to be stored in memory. Defaults to storing value as is.
     * @param [deserializer] {Function} Function to deserialize value retrieved from memory. Defaults to returning value as is.
     */
    defineMapPropertyInMemory: function (Class, mapProperty, serializer, deserializer) {
        serializer = serializer || function (value) { return value; };
        deserializer = deserializer || function (key, value) { return value; };
        let _mapProperty = "_" + mapProperty;

        let createActualValue = function (memoryValue) {
            let cacheValue = {}, actualValue = {};
            // function to add new key
            Object.defineProperty(actualValue, "addKey", {
                value: function (key, value) {
                    if (value) {
                        cacheValue[key] = value;
                        memoryValue[key] = serializer(value);
                    }
                    Object.defineProperty(actualValue, key, {
                        get: function () {
                            // if the cache doesnt have the value, get the value from memory
                            if (!_.has(cacheValue, key)) {
                                // if it is in memory, create a new instance with stored id
                                if (_.has(memoryValue, key)) {
                                    cacheValue[key] = deserializer(key, memoryValue[key]);
                                }
                            }
                            return cacheValue[key];
                        },
                        set: function (newValue) {
                            // set the instance to cache
                            cacheValue[key] = newValue;
                            // and id to memory
                            memoryValue[key] = serializer(newValue);
                        },
                        enumerable: true,
                        configurable: true
                    });
                },
                enumerable: false
            });

            Object.defineProperty(actualValue, "deleteKey", {
                value: function(key) {
                    delete actualValue[key];
                    delete cacheValue[key];
                    delete memoryValue[key];
                },
                enumerable: false
            });

            // copy all keys
            for (let k in memoryValue) {
                actualValue.addKey(k, deserializer(k, memoryValue[k]));
            }

            return actualValue;
        };

        // define the actual map property
        Object.defineProperty(Class.prototype, mapProperty, {
            get: function () {
                // if map is not cached, assign _mapValue and get the instance for any stored ids in memory
                if (!_.has(this, _mapProperty)) {
                    // if map is not in memory, assign mapValue to memory
                    if (!_.has(this.memory, mapProperty)) {
                        this.memory[mapProperty] = {};
                    }
                    this[_mapProperty] = createActualValue(this.memory[mapProperty]);
                }
                return this[_mapProperty];
            },
            enumerable: true,
            configurable: true
        });
    },

    /**
     * Defines a property which references an instance. Instance is stored by 'name' in memory.
     * Prototype should have a property 'memory'.
     *
     * @method defineInstanceMapPropertyInMemory
     * @param Class {Class} Class to define the 'property' on.
     * @param property {String}
     * @param [instanceGetter] {Function/Object} Called to get an instance for key and value. Can also be a map of key and class.
     */
    defineInstanceMapPropertyInMemory: function (Class, mapProperty, instanceGetter) {
        let _instanceGetter;
        if (instanceGetter.extend) {
            _instanceGetter = function (key, id) {
                // eslint-disable-next-line new-cap
                return new instanceGetter(id);
            };
        } else if (_.isFunction(instanceGetter)) {
            _instanceGetter = instanceGetter;
        } else {
            _instanceGetter = function (key, id) {
                // eslint-disable-next-line new-cap
                return new instanceGetter[key](id);
            };
        }
        this.defineMapPropertyInMemory(Class, mapProperty, function (value) {
            return value && value.id;
        }, function (key, value) {
            let instance = _instanceGetter(key, value);
            instance[this.constructor.className] = this;
            return instance;
        });
    },

    /**
     * Defines map of path.
     *
     * @method definePathMapPropertyInMemory
     * @param Class {Class} Class to define the 'property' on.
     * @param property {String}
     */
    definePathMapPropertyInMemory: function (Class, mapProperty) {
        this.defineMapPropertyInMemory(Class, mapProperty, (value) => {
            return Room.serializePath(value);
        }, (key, value) => {
            return Room.deserializePath(value);
        });
    },

    addMemorySupport: function (Class, memoryName) {
        Object.defineProperty(Class.prototype, "memory", {
            get: function () {
                if (!Memory[memoryName]) {
                    Memory[memoryName] = {};
                }
                Memory[memoryName][this.id] = Memory[memoryName][this.id] || {};
                return Memory[memoryName][this.id];
            },
            set: function (value) {
                if (!Memory[memoryName]) {
                    Memory[memoryName] = {};
                }
                Memory[memoryName][this.id] = value;
            },
            enumerable: true,
            configurable: true
        });
    },

    getClosestObject: function (creep, targets, filterFunction = function () { return true; }) {
        return _.minBy(targets.map((targetId) => {
            return Game.getObjectById(targetId);
        }).filter(filterFunction), (target) => {
            return math.getDistanceBetweenPos(creep.pos, target.pos);
        });
    },

    getClosestEdge: function (edges, filterFunction = function () { return true; }) {
        return _.minBy(edges.filter(filterFunction), (edge) => {
            return math.getDistanceBetweenPos(edge.pos0, edge.pos1);
        });
    }
};
