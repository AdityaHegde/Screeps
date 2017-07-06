module.exports = {
    definePropertyInMemory : function(prototype, property, getter) {
        let _property = "_" + property;
        Object.defineProperty(prototype, property, {
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

    defineInstancePropertyInMemory : function(prototype, property, ClassObject) {
        let _property = "_" + property;
        Object.defineProperty(prototype, property, {
            get : function() {
                //if the property is not defined in cache yet, get it from memory
                if (!_.has(this, _property)) {
                    let instance;
                    //if the property is not present in the memory either, create a new instance
                    if (!_.has(this.memory, property)) {
                        //only create a new instance if ClassObject is specified
                        //it is not specified for engine objects like Creep or Spawn
                        if (ClassObject) {
                            instance = new ClassObject()
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
                            instance = Game.getObjectById(this.memory[property])
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
        });
    },

    defineInstancePropertyByNameInMemory : function(prototype, property, memoryName) {
        let _property = "_" + property;
        Object.defineProperty(prototype, property, {
            get : function() {
                //if the property is not defined in cache yet, get it from memory
                if (!_.has(this, _property)) {
                    //if the property is in memory, get the instance from memory by name
                    if (_.has(this.memory, property) {
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
        });
    },

    addMemorySupport : function(prototype, memoryName) {
        Object.defineProperty(prototype, "memory", {
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

    getClosestObject : function(creep, targets) {
        let distanceObj = targets.reduce((curDistanceObj, targetId) => {
            let target = Game.getObjectById(targetId);
            let distanceFromCreep = Math.sqrt((creep.pos.x - target.pos.x) * (creep.pos.x - target.pos.x) + (creep.pos.y - target.pos.y) * (creep.pos.y - target.pos.y));
            if (distanceFromCreep < curDistanceObj.distance) {
                return {
                    distance : distanceFromCreep,
                    targetId : targetId,
                };
            }
            return curDistanceObj;
        }, {
            distance : 99999,
        });
        return distanceObj.targetId;
    },
};
