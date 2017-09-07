/* globals Room, FIND_MINERALS */

let utils = require("utils");

utils.defineInstancePropertyInMemory(Room, "mineral", null, function () {
    return this.find(FIND_MINERALS)[0];
});
