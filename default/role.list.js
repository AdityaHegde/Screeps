var constants = require("constants");

module.exports = [{
    roles : {
        worker : require("role.worker"),
    },
    switchRole : function(room) {
        return room.tasksInfo.store.potentialTargets.length + room.tasksInfo["withdraw.upgrader"].potentialTargets.length >= room.basePlanner.plannerInfo.container.paths.length;
    },
    order : ["worker"],
}, {
    roles : {
        builder : require("role.builder"),
        harvester : require("role.harvester"),
        hauler : require("role.hauler"),
        upgrader : require("role.upgrader"),
        defender : require("role.defender"),
        tower : require("role.tower"),
    },
    switchRole : function() {
        return false;
    },
    creepDistribution : {
        worker : ["harvester", "hauler", "builder", "upgrader"],
    },
    order : ["defender", "tower", "harvester", "hauler", "builder", "upgrader"],
}];
