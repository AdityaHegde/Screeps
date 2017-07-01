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
                return Memory[memoryName][this.id] = Memory[memoryName][this.id] || {};
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
};
