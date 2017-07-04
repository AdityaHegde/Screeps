module.exports = {
    definePropertyInMemory : function(prototype, property, getter) {
        let _property = "_" + property;
        Object.defineProperty(prototype, property, {
            get : function() {
                if (!_.has(this, _property)) {
                    if (!_.has(this.memory, property)) {
                        this.memory[property] = getter.call(this, ...arguments);
                    }
                    this[_property] = this.memory[property];
                }
                return this[_property];
            },
            set : function(value) {
                this.memory[property] = value;
                this[_property] = value;
            },
            enumerable: true,
            configurable: true,
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
        var distanceObj = targets.reduce((curDistanceObj, targetId) => {
            var target = Game.getObjectById(targetId);
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
