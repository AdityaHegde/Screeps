let utils = require("utils");

Memory.ids = Memory.ids || {};

module.exports = function(className, memoryName) {
    Memory.ids[memoryName] = Memory.ids[memoryName] || 0;

    let ClassFunction = function(id) {
        if (arguments.length > 0) {
            this.id = id;
        }
        else {
            this.id = className + "_" + (++Memory.ids[memoryName]);
        }
    };

    ClassFunction.className = className;
    ClassFunction.memoryName = memoryName;

    utils.addMemorySupport(ClassFunction, memoryName);

    ClassFunction.extend = function(members, staticMembers) {
        let child = function() {
            ClassFunction.call(this, ...arguments);
        };

        child.prototype = Object.create(this.prototype);
        child.prototype.constructor = child;
        child.parent = this;

        child.extend = this.extend;

        if (members) {
            for(let m in members) {
                if(members.hasOwnProperty(m)) {
                    child.prototype[m] = members[m];
                }
            }
        }
        child.__staticMembers = {};
        if (staticMembers) {
            for(let sm in staticMembers) {
                if(staticMembers.hasOwnProperty(sm)) {
                    child[sm] = staticMembers[sm];
                    child.__staticMembers[sm] = 1;
                }
            }
        }
        if (this.__staticMembers) {
            for (let sm in this.__staticMembers) {
                if (this.__staticMembers.hasOwnProperty(sm) && !child.__staticMembers.hasOwnProperty(sm)) {
                    child[sm] = this[sm];
                    child.__staticMembers[sm] = 1;
                }
            }
        }

        return child;
    };

    return ClassFunction;
};
