module.exports = {
    /**
     * Defines a property which get cached and returns from cache.
     *
     * @method definePropertyInMemory
     * @param Class {Class} Class to define the 'property' on.
     * @param property {String}
     * @param getter {Function} Function that returns the initial value for 'property'.
     */
    definePropertyInCache : function(Class, property, getter) {
        let _property = "_" + property;
        Object.defineProperty(Class.prototype, property, {
            get : function() {
                //if the property is not defined in cache yet, get it from memory
                if (!_.has(this, _property)) {
                    this[_property] = getter.call(this, ...arguments);
                }
                //return from cache
                return this[_property];
            },
            set : function(value) {
                //save the value to the cache
                this[_property] = value;
            },
            enumerable: true,
            configurable: true,
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
    definePropertyInMemory : function(Class, property, getter, serializer, deserializer) {
        getter = getter || function() { return null; };
        serializer = serializer || function(value) { return value; };
        deserializer = deserializer || function(value) { return value; };
        let _property = "_" + property;
        Object.defineProperty(Class.prototype, property, {
            get : function() {
                //console.log("get", property);
                //if the property is not defined in cache yet, get it from memory
                if (!_.has(this, _property)) {
                    //if the property is not present in the memory either, use the getter function passed to get the value and store in memory
                    if (!_.has(this.memory, property)) {
                        this[_property] = getter.call(this, ...arguments);
                        this.memory[property] = this[_property] && serializer(this[_property]);
                    }
                    else {
                        this[_property] = deserializer(this.memory[property]);
                    }
                }
                //return from cache
                return this[_property];
            },
            set : function(value) {
                //console.log("set", property);
                //save the serialized value to memory and value to cache
                if (value != null && value != undefined) {
                    this.memory[property] = serializer(value);
                }
                this[_property] = value;
            },
            enumerable: true,
            configurable: true,
        });
    },

    /**
     * Defines a property which references an instance. Instance is stored by 'id' in memory.
     * Prototype should have a property 'memory'.
     *
     * @method definePropertyInMemory
     * @param Class {Class} Class to define the 'property' on.
     * @param property {String}
     * @param [ClassObject] {Class} Class for the instance. If not specified, Game.getObjectById is used.
     * @param [getter] {Function} Function that returns the initial value for 'property'. Defaults value to empty instance of ClassObject.
     */
    defineInstancePropertyInMemory : function(Class, property, ClassObject, getter) {
        this.definePropertyInMemory(Class, property, () => {
            return getter ? getter.call(this) : (ClassObject && new ClassObject());
        }, (instance) => {
            return instance.id;
        }, (instanceId) => {
            if (ClassObject) {
                return new ClassObject(instanceId);
            }
            else {
                return Game.getObjectById(instanceId);
            }
        });
    },

    /**
     * Defines a property which references an instance. Instance is stored by 'name' in memory.
     * Prototype should have a property 'memory'.
     *
     * @method definePropertyInMemory
     * @param Class {Class} Class to define the 'property' on.
     * @param property {String}
     * @param memoryName {String} memoryName for the class of instance on Game.
     */
    defineInstancePropertyByNameInMemory : function(Class, property, memoryName) {
        this.definePropertyInMemory(Class, property, null, (instance) => {
            return instance.name;
        }, (instanceId) => {
            return Game[memoryName][instanceId];
        });
    },

    /**
     * Defines path property which is stored in memory using Room.serializePath.
     * And retrieved from memory using Room.deserializePath.
     *
     * @method definePropertyInMemory
     * @param Class {Class} Class to define the 'property' on.
     * @param property {String}
     */
    definePathPropertyInMemory : function(Class, property) {
        this.definePropertyInMemory(Class, property, null, Room.serializePath, Room.deserializePath);
    },

    /**
     * Defines CostMatrix property which is stored in memory using costMatrix.serialize.
     * And retrieved from memory using PathFinder.CostMatrix.deserialize.
     *
     * @method definePropertyInMemory
     * @param Class {Class} Class to define the 'property' on.
     * @param property {String}
     */
    defineCostMatrixPropertyInMemory : function(Class, property) {
        this.definePropertyInMemory(Class, property, null, (costMatrix) => {
            return costMatrix.serialize();
        }, PathFinder.CostMatrix.deserialize);
    },

    /**
     * Defines a property which references an instance. Instance is stored by 'name' in memory.
     * Prototype should have a property 'memory'.
     *
     * @method definePropertyInMemory
     * @param Class {Class} Class to define the 'property' on.
     * @param property {String}
     * @param memoryName {String} memoryName for the class of instance on Game.
     * @param instanceGetter {Function/Object} Called to get an instance for key and value. Can also be a map of key and class.
     */
    defineMapPropertyInMemory : function(Class, mapProperty, memoryName, instanceGetter) {
        let _instanceGetter;
        if (_.isFunction(instanceGetter)) {
            _instanceGetter = instanceGetter;
        }
        else {
            _instanceGetter = function(key, id) {
                return new instanceGetter[key](id);
            };
        }
        let _mapProperty = "_" + mapProperty;

        let createActualValue = function(memoryValue) {
            let cacheValue = {}, actualValue = {};
            //function to add new key
            Object.defineProperty(actualValue, "addKey", {
                value : function(key, value) {
                    if (value) {
                        cacheValue[key] = value;
                        memoryValue[key] = value.id;
                    }
                    Object.defineProperty(actualValue, key, {
                        get : function() {
                            //if the cache doesnt have the value, get the value from memory
                            if (!_.has(cacheValue, key)) {
                                //if it is in memory, create a new instance with stored id
                                if (_.has(memoryValue, key)) {
                                    cacheValue[key] = _instanceGetter(key, memoryValue[key]);
                                }
                            }
                            return cacheValue[key];
                        },
                        set : function(newValue) {
                            //set the instance to cache
                            cacheValue[key] = newValue;
                            //and id to memory
                            memoryValue[key] = newValue.id;
                        },
                        enumerable: true,
                        configurable: true,
                    });
                },
                enumerable : false,
            });

            //copy all keys
            for (let k in memoryValue) {
                actualValue.addKey(k, _instanceGetter(k, memoryValue[k]));
            }

            return actualValue;
        };

        //define the actual map property
        Object.defineProperty(Class.prototype, mapProperty, {
            get : function() {
                //console.log("get", mapProperty);
                //if map is not cached, assign _mapValue and get the instance for any stored ids in memory
                if (!_.has(this, _mapProperty)) {
                    //if map is not in memory, assign mapValue to memory
                    if (!_.has(this.memory, mapProperty)) {
                        this.memory[mapProperty] = {};
                    }
                    this[_mapProperty] = createActualValue(this.memory[mapProperty]);
                }
                return this[_mapProperty];
            },
            set : function(value) {
                //console.log("set", mapProperty);
                //cannot be written from outside
            },
            enumerable: true,
            configurable: true,
        });
    },

    addMemorySupport : function(Class, memoryName) {
        Object.defineProperty(Class.prototype, "memory", {
            get : function() {
                if (!Memory[memoryName]) {
                    Memory[memoryName] = {};
                }
                Memory[memoryName][this.id] = Memory[memoryName][this.id] || {};
                return Memory[memoryName][this.id];
            },
            set : function(value) {
                if (!Memory[memoryName]) {
                    Memory[memoryName] = {};
                }
                Memory[memoryName][this.id] = value;
            },
            enumerable: true,
            configurable: true,
        });
    },

    getClosestObject : function(creep, targets, filterFunction) {
        filterFunction = filterFunction || function() { return true; };
        let distanceObj = targets.reduce((curDistanceObj, targetId) => {
            let target = Game.getObjectById(targetId);
            if (filterFunction(target)) {
                let distanceFromCreep = Math.sqrt((creep.pos.x - target.pos.x) * (creep.pos.x - target.pos.x) + (creep.pos.y - target.pos.y) * (creep.pos.y - target.pos.y));
                if (distanceFromCreep < curDistanceObj.distance) {
                    return {
                        distance : distanceFromCreep,
                        targetId : targetId,
                    };
                }
            }
            return curDistanceObj;
        }, {
            distance : 99999,
        });
        return distanceObj.targetId;
    },
};
