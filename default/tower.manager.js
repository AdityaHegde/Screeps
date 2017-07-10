let constants = require("constants");
let utils = require("utils");

//make the tower look lika a creep so that it can be added to role-task pipeline
utils.addMemorySupport(StructureTower, "creeps");

utils.definePropertyInMemory(StructureTower, "name", function() {
    return this.id;
});

utils.definePropertyInMemory(StructureTower, "role", function() {
    return null;
});

utils.definePropertyInMemory(StructureTower, "task", function() {
    return null;
});
