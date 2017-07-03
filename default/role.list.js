module.exports = [{
    roles : {
        worker : require("role.worker"),
    },
    switchRole : function(room) {
        if (room.listenEvents[constants.CONTAINER_BUILT]) {
            room.containerCount += room.listenEvents[constants.CONTAINER_BUILT].length;
        }
        return room.containerCount >= room.buildPlanner.plannerInfo.container.paths.length;
    },
    order : ["worker"],
}, {
    roles : {
        builder : require("role.builder"),
        harvester : require("role.harvester"),
        hauler : require("role.hauler"),
        upgrader : require("role.upgrader"),
        maintainer : require("role.maintainer"),
        defender : require("role.defender"),
        tower : require("role.tower"),
    },
    switchRole : function() {
        return false;
    },
    creepDistribution : {
        worker : ["harvester", "hauler", "builder", "upgrader", "maintainer"],
    },
    order : ["defender", "tower", "harvester", "hauler", "builder", "upgrader", "maintainer"],
}];
