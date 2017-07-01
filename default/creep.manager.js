var utils = require("utils");
var constants = require("constants");

utils.definePropertyInMemory(Creep.prototype, "role", function() {
    return null;
});

utils.definePropertyInMemory(Creep.prototype, "task", function() {
    return null;
});

utils.definePropertyInMemory(Creep.prototype, "assignedSource", function() {
    return null;
});

Creep.prototype.executeTask = function(room) {
    if (this.task) {
        var roleInfo = room.rolesInfo[this.role.name];
        var currentTask = roleInfo.tasks[this.task.tier][this.task.current];
        var returnValue = TASKS[currentTask].execute(spawn, worker, this.tasksInfo[currentTask]);
        switch (returnValue) {
            case ERR_INVALID_TARGET:
            case ERR_NO_BODYPART:
            case ERR_RCL_NOT_ENOUGH:
                room.reassignTask(worker);
                break;

            case ERR_NOT_ENOUGH_RESOURCES:
            case constants.ERR_INVALID_TASK:
                room.switchTask(worker);
                break;

            case OK:
            case ERR_BUSY:
            default:
                break;
        }
    }
    else {
        room.assignTask(worker, true);
    }
};
