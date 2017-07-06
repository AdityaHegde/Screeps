let constants = require("constants");
let utils = require("utils");

//make the tower look lika a creep so that it can be added to role-task pipeline
utils.addMemorySupport(StructureTower.prototype, "creeps");

utils.definePropertyInMemory(StructureTower.prototype, "name", function() {
    return this.id;
});

utils.definePropertyInMemory(StructureTower.prototype, "role", function() {
    return null;
});

utils.definePropertyInMemory(StructureTower.prototype, "task", function() {
    return null;
});
