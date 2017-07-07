let constants = require("constants");

module.exports = [{
    roles : {
        worker : require("role.worker"),
    },
    switchRole : function(room) {
        return room.tasksInfo.store.potentialTargets.length + room.tasksInfo.withdrawUpgrader.potentialTargets.length >= room.buildInfo.container.paths.length;
    },
    order : ["worker"],
}, {
    roles : {
        builder : require("role.builder"),
        defender : require("role.defender"),
        harvester : require("role.harvester"),
        hauler : require("role.hauler"),
        tower : require("role.tower"),
        upgrader : require("role.upgrader"),
    },
    switchRole : function() {
        return false;
    },
    creepDistribution : {
        worker : ["harvester", "hauler", "builder", "upgrader"],
    },
    order : ["defender", "tower", "harvester", "hauler", "builder", "upgrader"],
}];
