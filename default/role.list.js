let constants = require("constants");

module.exports = {
    suites : [{
        switchRole : function(room) {
            return room.tasksInfo.store.potentialTargets.length + room.tasksInfo.withdrawUpgrader.potentialTargets.length >= room.buildPlanner.buildInfo.container.paths.length;
        },
        order : ["worker"],
    }, {
        switchRole : function() {
            return false;
        },
        creepDistribution : {
            worker : ["harvester", "hauler", "builder", "upgrader"],
        },
        order : ["defender", "tower", "harvester", "hauler", "builder", "upgrader"],
    }],
    roles : {
        builder : require("role.builder"),
        defender : require("role.defender"),
        harvester : require("role.harvester"),
        hauler : require("role.hauler"),
        tower : require("role.tower"),
        upgrader : require("role.upgrader"),
        worker : require("role.worker"),
    },
};
