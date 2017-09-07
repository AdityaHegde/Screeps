/* globals Game, CONTROLLER_STRUCTURES */

module.exports = {
    types: {
        "spawn": require("build.spawn"),
        "container": require("build.container"),
        "extension": require("build.extension"),
        "road": require("build.road"),
        "wall": require("build.wall"),
        "tower": require("build.tower")
    },
    initObjects: [{
        getter: function (buildPlanner) {
            return [buildPlanner.center];
        },
        type: "spawn"
        // maxCount : CONTROLLER_STRUCTURES.spawn[8],
    }, {
        getter: function (buildPlanner) {
            let cursorObjects = [];
            cursorObjects.push(...buildPlanner.room.sources.map((energySource) => {
                return {
                    source: buildPlanner.center,
                    target: energySource,
                    range: 1
                };
            }), {
                source: buildPlanner.center,
                target: buildPlanner.room.controller,
                range: 3
            }, {
                source: buildPlanner.center,
                target: buildPlanner.room.mineral,
                range: 3
            });
            return cursorObjects;
        },
        type: "road"
    }, {
        getter: function (buildPlanner) {
            return Object.keys(Game.map.describeExits(buildPlanner.room.name));
        },
        type: "wall"
    }, {
        getter: function (buildPlanner) {
            let paths = [];
            for (let i = 0; i <= buildPlanner.room.sourceManager.sources.length; i++) {
                paths.push(buildPlanner.room.pathManager.pathsInfo[i]);
            }
            return paths;
        },
        type: "container"
    }, {
        getter: function (buildPlanner) {
            let paths = [];
            for (let i = 0; i <= buildPlanner.room.sourceManager.sources.length; i++) {
                paths.push(buildPlanner.room.pathManager.pathsInfo[i]);
            }
            return paths;
        },
        type: "tower"
        // maxCount : CONTROLLER_STRUCTURES.tower[8],
    }, {
        getter: function (buildPlanner) {
            let paths = [];
            for (let i = 0; i <= buildPlanner.room.sourceManager.sources.length; i++) {
                paths.push(buildPlanner.room.pathManager.pathsInfo[i]);
            }
            return paths;
        },
        type: "extension",
        maxCount: CONTROLLER_STRUCTURES.extension[8]
    }]
};
