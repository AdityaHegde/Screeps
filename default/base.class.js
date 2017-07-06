let utils = require("utils");

Memory.ids = Memory.ids || {};

module.exports = function(className) {
    Memory.ids[className] = Memory.ids[className] || 0;

    let ClassFunction = function(id) {
        if (arguments.length > 0) {
            this.id = id;
        }
    };

    utils.addMemorySupport(ClassFunction.prototype, className);

    utils.definePropertyInMemory(ClassFunction.prototype, "id", () => {
        return className + "_" + (++Memory.ids[className]);
    });

    ClassFunction.extend = function(members, staticMembers) {
        let child = function() {};

        child.prototype = Object.create(this.prototype);
        child.prototype.constructor = ClassFunction;
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
            for (sm in this.__staticMembers) {
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
