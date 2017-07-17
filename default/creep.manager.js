let utils = require("utils");

utils.definePropertyInMemory(Creep, "role");

utils.definePropertyInMemory(Creep, "task");

utils.definePropertyInMemory(Creep, "pathIdx", function() {
    return 0;
});
utils.definePropertyInMemory(Creep, "pathPos", function() {
    return 0;
});
utils.definePropertyInMemory(Creep, "targetPathPos", function() {
    return 0;
});

//swapPos
//processed
//moved

utils.defineInstancePropertyInMemory(Creep, "gridPosition", GridPostition, function() {
    return null;
});
utils.definePosPropertyInMemory(Creep, "gridMove");

Creep.className = "creep";
Creep.memoryName = "creeps";
