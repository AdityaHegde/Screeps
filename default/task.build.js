var constants = require("constants");
var baseTask = require("task.base")

module.exports = _.merge({}, baseTask, {
    tick : function(room, taskInfo) {
        taskInfo.hasUpdatedTargets = false;
        if (room.listenEvents[constants.CONSTRUCTION_SITE_ADDED]) {
            this.updateTargets(room, taskInfo);
        }
    },

    getTargets : function(room, taskInfo) {
        return room.room.find(FIND_CONSTRUCTION_SITES).map((target) => target.id);
    },

    doTask : function(creep, target) {
        return creep.build(target);
    },
};
