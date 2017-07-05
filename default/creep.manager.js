let utils = require("utils");
let constants = require("constants");

Memory.ids = Memory.ids || {};
Memory.ids["task"] = Memory.ids["task"] || 0;

let Task = function(id) {
    this.id = id || ("task_" + (++Memory.ids["task"]));
};

utils.addMemorySupport(Task.prototype, "tasks");

utils.definePropertyInMemory(Task.prototype, "tier", function() {
    return 0;
});

utils.definePropertyInMemory(Task.prototype, "tasks", function() {
    return {};
});

utils.definePropertyInMemory(Task.prototype, "current", function() {
    return null;
});

utils.definePropertyInMemory(Task.prototype, "target", function() {
    return null;
});

utils.definePropertyInMemory(Task.prototype, "source", function() {
    return null;
});

utils.definePropertyInMemory(Task.prototype, "targetType", function() {
    return null;
});



utils.definePropertyInMemory(Creep.prototype, "role", function() {
    return null;
});

utils.defineInstancePropertyInMemory(Creep.prototype, "task", Task);
