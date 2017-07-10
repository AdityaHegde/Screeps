module.exports = {
    /**
     * Defines a property which gets mirrored in memory. Prototype should have a property 'memory'
     *
     * @method definePropertyInMemory
     * @param Class {Class} Class to define the 'property' on.
     * @param property {String}
     * @param getter {Function} Function that returns the initial value for 'property'.
     */
    definePropertyInMemory : function(Class, property, getter) {
        let _property = "_" + property;
        Object.defineProperty(Class.prototype, property, {
            get : function() {
                //if the property is not defined in cache yet, get it from memory
                if (!_.has(this, _property)) {
                    //if the property is not present in the memory either, use the getter function passed to get the value and store in memory
                    if (!_.has(this.memory, property)) {
                        this.memory[property] = getter.call(this, ...arguments);
                    }
                    this[_property] = this.memory[property];
                }
                //return from cache
                return this[_property];
            },
            set : function(value) {
                //save the value to memory and to the cache
                this.memory[property] = value;
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
     * @param ClassObject {Class} Class for the instance.
     */
    defineInstancePropertyInMemory : function(Class, property, ClassObject) {
        let _property = "_" + property;
        Object.defineProperty(Class.prototype, property, {
            get : function() {
                //if the property is not defined in cache yet, get it from memory
                if (!_.has(this, _property)) {
                    let instance;
                    //if the property is not present in the memory either, create a new instance
                    if (!_.has(this.memory, property)) {
                        //only create a new instance if ClassObject is specified
                        //it is not specified for engine objects like Creep or Spawn
                        if (ClassObject) {
                            instance = new ClassObject();
                            this.memory[property] = instance.id;
                        }
                    }
                    //else create a new instance with exisiting id from memory
                    else {
                        //if ClassObject is specified, create an instance with id from memory
                        if (ClassObject) {
                            instance = new ClassObject(this.memory[property]);
                        }
                        //else use getObjectById to get the object for engine objects like Creep or Spawn
                        else {
                            instance = Game.getObjectById(this.memory[property]);
                        }
                    }
                    this[_property] = instance;
                }
                return this[_property];
            },
            set : function(value) {
                //if the value is already an id, store it in memory only
                if (_.isString(value)) {
                    this.memory[property] = value;
                    //remove the cache so that if and when the property is accessed it is recalculated
                    delete this[_property];
                }
                else {
                    //store only the id in the memory
                    //can be set to null
                    this.memory[property] = value && value.id;
                    //but the entire instance in the cache
                    this[_property] = value;
                }
            },
            enumerable: true,
            configurable: true,
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
        let _property = "_" + property;
        Object.defineProperty(Class.prototype, property, {
            get : function() {
                //if the property is not defined in cache yet, get it from memory
                if (!_.has(this, _property)) {
                    //if the property is in memory, get the instance from memory by name
                    if (_.has(this.memory, property)) {
                        this[_property] = Game[memoryName][this.memory[property]];
                    }
                }
                return this[_property];
            },
            set : function(value) {
                //if the value is already an id, store it in memory only
                if (_.isString(value)) {
                    this.memory[property] = value;
                    this[_property] = Game[memoryName][value];
                }
                else {
                    //store only the name in the memory
                    //can be set to null
                    this.memory[property] = value && value.name;
                    //but the entire instance in the cache
                    this[_property] = value;
                }
            },
            enumerable: true,
            configurable: true,
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
        let memoryValue = {}, cacheValue = {}, actualValue = {};
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

        //define the actual map property
        Object.defineProperty(Class.prototype, mapProperty, {
            get : function() {
                //if map is not cached, assign _mapValue and get the instance for any stored ids in memory
                if (!_.has(this, _mapProperty)) {
                    //if map is not in memory, assign mapValue to memory
                    if (!_.has(this.memory, mapProperty)) {
                        this.memory[mapProperty] = {};
                    }
                    memoryValue = this.memory[mapProperty]
                    //copy all keys
                    for (let k in memoryValue) {
                        actualValue.addKey(k, _instanceGetter(k, memoryValue[k]));
                    }
                    this[_mapProperty] = actualValue;
                }
                return this[_mapProperty];
            },
            set : function(value) {
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
        filterFunction = filterFunction || function() { return true };
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
