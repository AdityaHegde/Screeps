var utils = require("utils");
var constants = require("constants");
var TASKS = require("task.list");

utils.definePropertyInMemory(Creep.prototype, "role", function() {
    return null;
});

utils.definePropertyInMemory(Creep.prototype, "task", function() {
    return null;
});
